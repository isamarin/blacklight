use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Duration;

use gilrs::{Axis, Button, Gamepad, Gilrs};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

const POLL_MS: u64 = 8;
const MAX_PADS: usize = 4;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct GamepadSnapshot {
	pub index: u8,
	pub id: String,
	pub name: String,
	pub buttons: u8,
	pub axes: u8,
	pub rumble: bool,
	pub state: HashMap<String, f32>,
}

pub struct GamepadHub(pub Mutex<Vec<GamepadSnapshot>>);

pub fn spawn_gamepad_poller(app: AppHandle) {
	std::thread::Builder::new()
		.name("blacklight-gamepads".into())
		.spawn(move || {
			let mut gilrs = match Gilrs::new() {
				Ok(gilrs) => gilrs,
				Err(error) => {
					eprintln!("[gamepad] gilrs init failed: {error}");
					return;
				}
			};

			let mut last_ids: Vec<String> = Vec::new();
			loop {
				while gilrs.next_event().is_some() {}

				let snapshots: Vec<GamepadSnapshot> = gilrs
					.gamepads()
					.take(MAX_PADS)
					.enumerate()
					.map(|(index, (_id, pad))| snapshot(index as u8, pad))
					.collect();

				let ids: Vec<String> = snapshots.iter().map(|pad| pad.id.clone()).collect();
				if let Some(state) = app.try_state::<GamepadHub>() {
					*state.0.lock().unwrap() = snapshots.clone();
				}
				if ids != last_ids {
					last_ids = ids;
					let _ = app.emit("gamepads-changed", &snapshots);
				}

				std::thread::sleep(Duration::from_millis(POLL_MS));
			}
		})
		.ok();
}

#[tauri::command]
pub fn list_gamepads(hub: tauri::State<GamepadHub>) -> Vec<GamepadSnapshot> {
	hub.0.lock().unwrap().clone()
}

fn snapshot(index: u8, pad: Gamepad<'_>) -> GamepadSnapshot {
	let mut state = HashMap::new();
	state.insert("A".into(), digital(pad, Button::South));
	state.insert("B".into(), digital(pad, Button::East));
	state.insert("X".into(), digital(pad, Button::West));
	state.insert("Y".into(), digital(pad, Button::North));
	state.insert("DPadUp".into(), digital(pad, Button::DPadUp));
	state.insert("DPadDown".into(), digital(pad, Button::DPadDown));
	state.insert("DPadLeft".into(), digital(pad, Button::DPadLeft));
	state.insert("DPadRight".into(), digital(pad, Button::DPadRight));
	state.insert("LeftShoulder".into(), digital(pad, Button::LeftTrigger));
	state.insert("RightShoulder".into(), digital(pad, Button::RightTrigger));
	state.insert("LeftThumb".into(), digital(pad, Button::LeftThumb));
	state.insert("RightThumb".into(), digital(pad, Button::RightThumb));
	state.insert("View".into(), digital(pad, Button::Select));
	state.insert("Menu".into(), digital(pad, Button::Start));
	state.insert("Nexus".into(), digital(pad, Button::Mode));
	state.insert(
		"LeftTrigger".into(),
		trigger(pad, Axis::LeftZ, Button::LeftTrigger2),
	);
	state.insert(
		"RightTrigger".into(),
		trigger(pad, Axis::RightZ, Button::RightTrigger2),
	);
	state.insert("LeftThumbXAxis".into(), axis(pad, Axis::LeftStickX, false));
	state.insert("LeftThumbYAxis".into(), axis(pad, Axis::LeftStickY, true));
	state.insert("RightThumbXAxis".into(), axis(pad, Axis::RightStickX, false));
	state.insert("RightThumbYAxis".into(), axis(pad, Axis::RightStickY, true));

	GamepadSnapshot {
		index,
		id: format!("{index}-{}", pad.name()),
		name: pad.name().to_string(),
		buttons: pad.state().buttons().count().min(255) as u8,
		axes: pad.state().axes().count().min(255) as u8,
		rumble: pad.is_ff_supported(),
		state,
	}
}

fn digital(pad: Gamepad<'_>, button: Button) -> f32 {
	if pad.is_pressed(button) {
		1.0
	} else {
		0.0
	}
}

fn axis(pad: Gamepad<'_>, axis: Axis, invert: bool) -> f32 {
	let value = pad.value(axis);
	if invert {
		-value
	} else {
		value
	}
}

pub fn normalize_trigger(value: f32, pressed: bool) -> f32 {
	if value > 0.05 {
		value.clamp(0.0, 1.0)
	} else if value < -0.05 {
		((value + 1.0) * 0.5).clamp(0.0, 1.0)
	} else if pressed {
		1.0
	} else {
		0.0
	}
}

fn trigger(pad: Gamepad<'_>, axis: Axis, button: Button) -> f32 {
	normalize_trigger(pad.value(axis), pad.is_pressed(button))
}

#[cfg(test)]
mod tests {
	use super::normalize_trigger;

	#[test]
	fn trigger_handles_zero_to_one_and_minus_one_rest() {
		assert_eq!(normalize_trigger(0.0, false), 0.0);
		assert_eq!(normalize_trigger(1.0, false), 1.0);
		assert!((normalize_trigger(-1.0, false) - 0.0).abs() < f32::EPSILON);
		assert!((normalize_trigger(0.0, true) - 1.0).abs() < f32::EPSILON);
		assert!((normalize_trigger(-0.2, false) - 0.4).abs() < 0.001);
	}
}
