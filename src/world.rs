use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct World {
    rows: i32,
    cols: i32,
}

#[wasm_bindgen]
impl World {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: i32, cols: i32) -> Self {
        World { 
            rows: rows,
            cols: cols,
        }
    }

    #[wasm_bindgen]
    pub fn get_rows(&self) -> i32 {
        self.rows
    }
}