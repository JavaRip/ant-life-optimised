use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn point_within_radius(a: i32, b: i32, x: i32, y: i32, r: i32) -> bool {
    let dist = (a - x) * (a - x) + (b - y) * (b - y);
    dist < r * r
}