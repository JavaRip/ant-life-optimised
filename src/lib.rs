use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use web_sys::console;

#[wasm_bindgen]
pub fn greet(name: JsValue) {
    let name_str = name.as_string().unwrap_or_else(|| "unknown".to_string());
    console::log_1(&format!("Hello, {}!", name_str).into());
}
