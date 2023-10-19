use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use web_sys::console;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: JsValue) {
    let name_str = name.as_string().unwrap_or_else(|| "unknown".to_string());
    console::log_1(&format!("Hello, {}!", name_str).into());
}

#[wasm_bindgen]
pub fn legal(x: i32, y: i32, rows: i32, cols: i32) -> bool {
    x >= 0 && y >= 0 && x < cols && y < rows
}

#[wasm_bindgen]
pub fn point_within_radius(a: i32, b: i32, x: i32, y: i32, r: i32) -> bool {
  let dist = (a - x) * (a - x) + (b - y) * (b - y);
  dist < r * r
}

