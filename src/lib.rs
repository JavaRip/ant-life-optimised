extern crate console_error_panic_hook;
use rand::Rng;
use std::panic;
use wasm_bindgen::prelude::*;
use web_sys::console;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash)]

pub enum TileType {
    Air,
    Soil,
    Sand,
    Stone,
    Worker,
    Queen,
    Egg,
    Corpse,
    Plant,
    Water,
    Fungus,
    Pest,
    Trail,
}

// Each chunk is essentially a hashmap from TileType to its count.
pub type Chunk = HashMap<TileType, i32>;

trait ChunkExt {
    fn increment(&mut self, tile: &TileType);
}

impl ChunkExt for Chunk {
    fn increment(&mut self, tile: &TileType) {
        let counter = self.entry(*tile).or_insert(0);
        *counter += 1;
    }
}

impl TileType {
    pub fn to_color(&self) -> &'static str {
        match self {
            TileType::Air => "skyblue",
            TileType::Soil => "peru",
            TileType::Sand => "sandybrown",
            TileType::Stone => "slategray",
            TileType::Worker => "red",
            TileType::Queen => "blueviolet",
            TileType::Egg => "white",
            TileType::Corpse => "black",
            TileType::Plant => "olivedrab",
            TileType::Water => "blue",
            TileType::Fungus => "teal",
            TileType::Pest => "fuchsia",
            TileType::Trail => "yellow",
        }
    }

    pub fn from_str(tile_str: &str) -> Result<Self, String> {
        match tile_str {
            "Air" => Ok(TileType::Air),
            "Soil" => Ok(TileType::Soil),
            "Sand" => Ok(TileType::Sand),
            "Stone" => Ok(TileType::Stone),
            "Worker" => Ok(TileType::Worker),
            "Queen" => Ok(TileType::Queen),
            "Egg" => Ok(TileType::Egg),
            "Corpse" => Ok(TileType::Corpse),
            "Plant" => Ok(TileType::Plant),
            "Water" => Ok(TileType::Water),
            "Fungus" => Ok(TileType::Fungus),
            "Pest" => Ok(TileType::Pest),
            "Trail" => Ok(TileType::Trail),
            _ => Err(format!("Unknown tile type: {}", tile_str)),
        }
    }
}

#[wasm_bindgen]
pub struct World {
    rows: i32,
    cols: i32,
    age: i32,
    ants: i32,
    tiles: Vec<Vec<String>>,
    chunks: Vec<Vec<Chunk>>,
    chunk_size: i32,
    tileset: Vec<TileType>,
}

#[wasm_bindgen]
impl World {
    // constructor
    #[wasm_bindgen(constructor)]
    pub fn constructor(rows: i32, cols: i32, age: i32, ants: i32, chunk_size: i32, js_tileset: JsValue) -> Self {
        panic::set_hook(Box::new(console_error_panic_hook::hook));

        // Parse js_tileset into a Vec<TileType>
        let tileset_array: Vec<String> = serde_wasm_bindgen::from_value(js_tileset).unwrap();

        let chunks = vec![vec![Chunk::new(); cols as usize]; rows as usize];

        let tileset = tileset_array.iter().map(|tile_str| {
            // Convert each JsValue into a Rust String
            let tile_string: String = tile_str.to_string();

            // Convert the Rust String into the appropriate TileType
            match tile_string.as_str() {
                "skyblue" => TileType::Air,
                "peru" => TileType::Soil,
                "sandybrown" => TileType::Sand,
                "slategray" => TileType::Stone,
                "red" => TileType::Worker,
                "blueviolet" => TileType::Queen,
                "white" => TileType::Egg,
                "black" => TileType::Corpse,
                "olivedrab" => TileType::Plant,
                "blue" => TileType::Water,
                "teal" => TileType::Fungus,
                "fuchsia" => TileType::Pest,
                "yellow" => TileType::Trail,
                _ => panic!("Unknown tile type!"),
            }
        }).collect::<Vec<TileType>>();

        let tiles = vec![vec![TileType::Air.to_color().to_string(); cols as usize]; rows as usize];

        console::log_1(&format!("WASM World constructor fired").into());
        World {
            rows,
            cols,
            age,
            ants,
            tiles,
            chunk_size,
            tileset,
            chunks,
        }
    }

    // getters & setters
    pub fn set_rows(&mut self, num: i32) -> Result<(), String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        match num {
            n if n > 0 => Ok(self.rows = n),
            _ => Err(format!("Number of rows must be positive integer")),
        }
    }

    pub fn get_rows(&self) -> i32 {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        self.rows
    }

    pub fn set_cols(&mut self, num: i32) -> Result<(), String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        match num {
            n if n > 0 => Ok(self.cols = n),
            _ => Err(format!("Number of columns must be positive integer")),
        }
    }

    pub fn get_cols(&self) -> i32 {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        self.cols
    }

    pub fn set_age(&mut self, num: i32) -> Result<(), String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        match num {
            n if n >= 0 => Ok(self.age = num),
            e => {
                web_sys::console::error_1(&e.into());
                Err(e.to_string())
            }
        }
    }

    pub fn get_age(&self) -> i32 {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        self.age
    }

    pub fn set_ants(&mut self, num: i32) -> Result<(), String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        match num {
            n if n >= 0 => Ok(self.ants = num),
            e => {
                web_sys::console::error_1(&e.into());
                Err(e.to_string())
            } 
        }
    }

    pub fn get_ants(&self) -> i32 {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        self.ants
    }

    pub fn set_tiles(&mut self, tiles_str: &str) -> Result<(), String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        let tiles: Result<Vec<Vec<String>>, _> = serde_json::from_str(tiles_str);
        match tiles {
            Ok(v) => Ok(self.tiles = v),
            Err(e) => Err(format!("Error parsing JSON: {}", e)),
        }
    }

    pub fn set_tile(&mut self, x: i32, y: i32, tile: &str, mask_str: Option<String>) -> bool {
        if !self.legal(x, y) {
            return false;
        }

        if let Some(mask) = &mask_str {
            if !self.check_tile(x, y, Some(mask.clone())) {
                return false;
            }
        } else {
            if !self.check_tile(x, y, None) {
                return false;
            }
        }
        
        self.tiles[y as usize][x as usize] = tile.to_string();
        true
    }

    pub fn get_tiles(&self) -> Result<String, String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        let tiles_str: Result<String, _> = serde_json::to_string(&self.tiles);
        match tiles_str {
            Ok(v) => Ok(v),
            Err(e) => Err(format!("Error parsing JSON: {}", e)),
        }
    }

    pub fn get_tile(&self, x: i32, y:i32) -> Result<String, String> {
        panic::set_hook(Box::new(console_error_panic_hook::hook));

        if !self.legal(x, y) {
            return Err(format!("Coordinates x: {}, y: {} are out of bounds.", x, y));
        }

        let tile_str: Result<String, _> = serde_json::to_string(&self.tiles[y as usize][x as usize]);
        match tile_str {
            Ok(v) => Ok(v),
            Err(e) => Err(format!("Error parsing JSON: {}", e)),
        }
    }

    pub fn get_chunks(&self, x: i32, y: i32, distance: i32) -> Result<String, JsValue> {
        // defined in definitions.js, temporarily hardcoded TODO
        let cx_min = ((x - distance) / &self.chunk_size).max(0);
        let cy_min = ((y - distance) / &self.chunk_size).max(0);
        let cx_max = ((x + distance) / &self.chunk_size).min(self.chunks[0].len() as i32 - 1);
        let cy_max = ((y + distance) / &self.chunk_size).min(self.chunks.len() as i32 - 1);

        let mut matches = Vec::new();
        for cx in cx_min..=cx_max {
            for cy in cy_min..=cy_max {
                matches.push(self.chunks[cy as usize][cx as usize].clone());
            }
        }
        serde_json::to_string(&matches).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    // functions
    pub fn update_chunks(&mut self) -> Result<(), String> {
        self.chunks.clear();

        for cy in 0..(self.rows / self.chunk_size) {
            let mut row = Vec::new();

            for cx in 0..(self.cols / self.chunk_size) {
                let mut blank_chunk = Chunk::default();
                
                let cy0 = cy * self.chunk_size;
                let cx0 = cx * self.chunk_size;

                self.for_each_tile(cx0, cy0, cx0 + self.chunk_size, cy0 + self.chunk_size, |x, y| {
                    if let Ok(tile_str) = self.get_tile(x, y) {
                        match TileType::from_str(&tile_str) {
                            Ok(tile) => {
                                blank_chunk.increment(&tile);
                            },
                            Err(_) => {
                                // Handle the error or skip the tile, based on your requirements.
                                // If you want to propagate this error, you might need to change the signature
                                // and structure of your update_chunks function to propagate it.
                            }
                        }
                    }
                });

                row.push(blank_chunk);
            }
            
            self.chunks.push(row);
        }
        Ok(())
    }

    fn for_each_tile<F: FnMut(i32, i32)>(&self, x0: i32, y0: i32, x1: i32, y1: i32, mut func: F) {
        for y in y0..y1 {
            for x in x0..x1 {
                if self.legal(x, y) {
                    func(x, y);
                }
            }
        }
    }

    pub fn do_rain(&mut self, count: f64, tile: Option<String>) {
        let tile = tile.unwrap_or("WATER".to_string());
        
        let mut real_count = count.floor() as i32;
        
        let mut rng = rand::thread_rng();
        if rng.gen::<f64>() <= count {
            real_count += 1;
        }

        for _ in 0..real_count {
            let x = rng.gen_range(0..self.cols);
            self.set_tile(x, self.rows - 1, &tile, Some(String::from("AIR")));
        }
    }

    pub fn legal(&self, x: i32, y: i32) -> bool {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        x >= 0 && y >= 0 && x < self.cols && y < self.rows
    }

    pub fn check_tile(&self, x: i32, y: i32, mask_str: Option<String>) -> bool {
        panic::set_hook(Box::new(console_error_panic_hook::hook));
        match mask_str {
            Some(mask_json) => {
                let mask: Result<Vec<String>, _> = serde_json::from_str(&mask_json);
                match mask {
                    Ok(m) => m.contains(&self.get_tile(x, y).unwrap()),
                    Err(_) => false, // If the JSON is invalid, we return false. Adapt this as needed.
                }
            }
            None => true,
        }
    }
}