use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn legal(x: i32, y: i32, rows: i32, cols: i32) -> bool {
    x >= 0 && y >= 0 && x < cols && y < rows
}