use wasm_bindgen::prelude::*;
use rand::prelude::*;

#[wasm_bindgen]
pub fn random_int_inclusive(min: f64, max: f64) -> i32 {
    let min = min.floor();
    let max = max.ceil();
    let rand: f64 = rand::thread_rng().gen();
    (rand * (max - min + 1.0) + min).floor() as i32
}