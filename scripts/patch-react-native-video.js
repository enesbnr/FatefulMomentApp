const fs = require('fs');
const path = require('path');

const exoPlayerViewPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-video',
  'android',
  'src',
  'main',
  'java',
  'com',
  'brentvatne',
  'exoplayer',
  'ExoPlayerView.kt',
);

if (!fs.existsSync(exoPlayerViewPath)) {
  process.exit(0);
}

const original = fs.readFileSync(exoPlayerViewPath, 'utf8');

if (original.includes('private var appliedSurfaceViewType: Int? = null')) {
  process.exit(0);
}

const stub = `    fun updateSurfaceView(viewType: Int) {
        // TODO: Implement proper surface type switching if needed
    }`;

if (!original.includes(stub)) {
  throw new Error(
    'react-native-video surface patch could not find the expected v6.19.2 stub.',
  );
}

const implementation = `    fun updateSurfaceView(viewType: Int) {
        if (appliedSurfaceViewType == viewType) {
            return
        }

        val currentSurfaceView = playerView.videoSurfaceView ?: return
        val shouldUseTextureView = viewType == RNVViewType.VIEW_TYPE_TEXTURE
        val isCurrentTextureView = currentSurfaceView is TextureView

        if (shouldUseTextureView == isCurrentTextureView) {
            if (!shouldUseTextureView && currentSurfaceView is SurfaceView) {
                currentSurfaceView.setSecure(viewType == RNVViewType.VIEW_TYPE_SURFACE_SECURE)
            }
            appliedSurfaceViewType = viewType
            return
        }

        val contentFrame =
            playerView.findViewById<AspectRatioFrameLayout>(androidx.media3.ui.R.id.exo_content_frame)
                ?: return
        val replacementSurfaceView: View = if (shouldUseTextureView) {
            TextureView(context).apply {
                isOpaque = false
            }
        } else {
            SurfaceView(context).apply {
                if (viewType == RNVViewType.VIEW_TYPE_SURFACE_SECURE) {
                    setSecure(true)
                }
            }
        }
        val insertIndex = contentFrame.indexOfChild(currentSurfaceView).coerceAtLeast(0)
        val player = playerView.player

        clearVideoSurface(player, currentSurfaceView)
        contentFrame.removeView(currentSurfaceView)
        replacementSurfaceView.layoutParams = FrameLayout.LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT,
        )
        contentFrame.addView(replacementSurfaceView, insertIndex)
        setInternalSurfaceViewField(replacementSurfaceView)
        attachVideoSurface(player, replacementSurfaceView)

        appliedSurfaceViewType = viewType
        playerView.requestLayout()
        requestLayout()
    }`;

const companionMarker = `    companion object {
        private const val TAG = "ExoPlayerView"
    }
`;

const helpers = `    companion object {
        private const val TAG = "ExoPlayerView"
    }

    private fun clearVideoSurface(player: Player?, surfaceView: View) {
        when (surfaceView) {
            is TextureView -> player?.clearVideoTextureView(surfaceView)
            is SurfaceView -> player?.clearVideoSurfaceView(surfaceView)
        }
    }

    private fun attachVideoSurface(player: Player?, surfaceView: View) {
        when (surfaceView) {
            is TextureView -> player?.setVideoTextureView(surfaceView)
            is SurfaceView -> player?.setVideoSurfaceView(surfaceView)
        }
    }

    private fun setInternalSurfaceViewField(surfaceView: View) {
        runCatching {
            val surfaceField = PlayerView::class.java.getDeclaredField("surfaceView")
            surfaceField.isAccessible = true
            surfaceField.set(playerView, surfaceView)
        }
    }
`;

const patched = original
  .replace(
    'import android.view.View\n',
    'import android.view.SurfaceView\nimport android.view.TextureView\nimport android.view.View\n',
  )
  .replace(
    'import com.brentvatne.common.api.SubtitleStyle\n',
    'import com.brentvatne.common.api.SubtitleStyle\nimport com.brentvatne.common.api.ViewType as RNVViewType\n',
  )
  .replace(
    '    private var pendingResizeMode: Int? = null\n',
    '    private var pendingResizeMode: Int? = null\n    private var appliedSurfaceViewType: Int? = null\n',
  )
  .replace(stub, implementation)
  .replace(companionMarker, helpers);

if (patched === original || !patched.includes('clearVideoTextureView')) {
  throw new Error('react-native-video surface patch was not applied completely.');
}

fs.writeFileSync(exoPlayerViewPath, patched);
