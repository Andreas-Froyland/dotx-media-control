use std::time::Duration;
use windows::Media::Control::GlobalSystemMediaTransportControlsSessionManager;

fn get_session(
) -> windows::core::Result<
    windows::Media::Control::GlobalSystemMediaTransportControlsSession,
> {
    let manager =
        GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.get()?;
    manager.GetCurrentSession()
}

/// Resume playback on the current media session. Returns 0 on success, negative on error.
#[no_mangle]
pub extern "C" fn media_play() -> i32 {
    match get_session() {
        Ok(session) => match session.TryPlayAsync().and_then(|op| op.get()) {
            Ok(_) => 0,
            Err(_) => -2,
        },
        Err(_) => -1,
    }
}

/// Pause playback on the current media session. Returns 0 on success, negative on error.
#[no_mangle]
pub extern "C" fn media_pause() -> i32 {
    match get_session() {
        Ok(session) => match session.TryPauseAsync().and_then(|op| op.get()) {
            Ok(_) => 0,
            Err(_) => -2,
        },
        Err(_) => -1,
    }
}

/// Skip to the next track. Returns 0 on success, negative on error.
#[no_mangle]
pub extern "C" fn media_next() -> i32 {
    match get_session() {
        Ok(session) => match session.TrySkipNextAsync().and_then(|op| op.get()) {
            Ok(_) => 0,
            Err(_) => -2,
        },
        Err(_) => -1,
    }
}

/// Go to the previous track (not restart). If the current playback position is more than 3
/// seconds in, TrySkipPreviousAsync is called twice: the first call restarts the track, and
/// after a short delay the second call skips back to the actual previous track.
#[no_mangle]
pub extern "C" fn media_previous() -> i32 {
    match get_session() {
        Ok(session) => {
            // 30_000_000 = 3 seconds in 100-nanosecond ticks
            let past_threshold = session
                .GetTimelineProperties()
                .and_then(|t| t.Position())
                .map(|p| p.Duration > 30_000_000)
                .unwrap_or(false);

            if past_threshold {
                // First call restarts current track; give the player a moment to settle
                let _ = session.TrySkipPreviousAsync().and_then(|op| op.get());
                std::thread::sleep(Duration::from_millis(150));
            }

            match session.TrySkipPreviousAsync().and_then(|op| op.get()) {
                Ok(_) => 0,
                Err(_) => -2,
            }
        }
        Err(_) => -1,
    }
}
