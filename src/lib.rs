extern crate console_error_panic_hook;
use rand::Rng;
use std::panic;
use wasm_bindgen::prelude::*;
use web_sys::console;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};


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
    rain_freq: i32,
    rain_time: i32,
    pest_freq: i32,
    pest_start: i32,
    world_age: i32,
    convert_prob: f32,
    kill_prob: i32,
    evaporate_prob: i32,
}

#[wasm_bindgen]
impl World {
    // constructor
    #[wasm_bindgen(constructor)]
    pub fn constructor(
        rows: i32, 
        cols: i32, 
        age: i32,
        ants: i32, 
        chunk_size: i32, 
        js_tileset: JsValue, 
        rain_freq: i32, 
        rain_time: i32, 
        pest_freq: i32, 
        pest_start: i32,
        convert_prob: f32,
        kill_prob: i32,
        evaporate_prob: i32,
    ) -> Self {
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
        let world_age = 0;

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
            rain_freq,
            rain_time,
            pest_freq,
            pest_start,
            world_age, 
            convert_prob,
            kill_prob,
            evaporate_prob,
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

    fn get_chunks(&self, x: i32, y: i32, distance: i32) -> Vec<Chunk> {
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
        matches
    }


    // functions
    fn swap_tiles(&mut self, x: i32, y: i32, a: i32, b: i32, mask: Option<String>) -> bool {
        if !self.check_tile(a, b, mask.clone()) {
            return false;
        } else {
            let t1 = self.get_tile(x, y).unwrap(); // TODO fix unwrap
            let t2 = self.get_tile(a, b).unwrap();
            if !self.set_tile(a, b, &t1, mask.clone()) {
                return false; // Added this check in case setting the tile failed
            }
            if !self.set_tile(x, y, &t2, mask) {
                return false; // Similarly, added this check too
            }
            true
        }
    }

    fn random_sign() -> i32 {
        let mut rng = rand::thread_rng();
        if rng.gen::<bool>() {
            1
        } else {
            -1
        }
    }

    fn touching(&self, x: i32, y: i32, mask: &Vec<&str>, radius: i32) -> usize {
        self.touching_which(x, y, mask, radius).len()
    }

    fn touching_which(&self, x: i32, y: i32, mask: &Vec<&str>, radius: i32) -> Vec<(i32, i32)> {
        // Serialize mask to JSON-like string (assuming the check_tile function uses this format).
        let mask_str = format!("{:?}", mask);

        // If no chunks in range contain target, skip searching
        let threshold = if self.check_tile(x, y, Some(mask_str.to_string())) { 2 } else { 1 };
        if !self.check_chunks(x, y, Some(mask), radius, threshold) {
            return vec![];
        }

        let mut touching = vec![];
        for a in (x - radius)..=(x + radius) {
            for b in (y - radius)..=(y + radius) {
                if a != x || b != y {
                    if self.check_tile(a, b, Some(mask_str.to_string())) {
                        touching.push((a, b));
                    }
                }
            }
        }
        touching
    }

    fn check_chunks(&self, x: i32, y: i32, mask: Option<&Vec<&str>>, distance: i32, threshold: i32) -> bool {
        if !self.legal(x, y) {
            return false;
        }
        if mask.is_none() {
            return true;
        }
        if threshold == 0 {
            return true;
        }
        
        let chunks = self.get_chunks(x, y, distance);
        let mut total = 0;
        
        for chunk in &chunks {
            if let Some(mask_ref) = &mask {
                for tile in mask_ref.iter() {
                    if let Ok(tile_type) = TileType::from_str(tile) {
                        total += chunk.get(&tile_type).unwrap_or(&0i32).clone();
                        if total > threshold {
                            return true;
                        }
                    } else {
                        continue;
                    }
                }
            }
        }
        
        false
    }


    fn sand_action(&mut self, x: i32, y: i32) -> bool { 
        let bias = Self::random_sign();
        
        let mask = Some("AIR,WATER".to_string());

        self.swap_tiles(x, y, x, y - 1, mask.clone()) ||
        self.swap_tiles(x, y, x + bias, y - 1, mask.clone()) ||
        self.swap_tiles(x, y, x - bias, y - 1, mask.clone())
    }

    fn corpse_action(&mut self, x: i32, y: i32) -> bool {
        // When touching plant, convert to plant
        if rand::random::<f32>() <= self.convert_prob * (self.touching(x, y, &vec!["PLANT"], 1) as f32) {
            self.set_tile(x, y, "PLANT", None);
            return true;
        }

        // Move down or diagonally down
        let bias = Self::random_sign();
        self.swap_tiles(x, y, x, y - 1, Some("AIR".to_string())) ||
        self.swap_tiles(x, y, x - bias, y - 1, Some("AIR".to_string())) ||
        self.swap_tiles(x, y, x + bias, y - 1, Some("AIR".to_string()))
    }

    fn water_action(&mut self, x: i32, y: i32) {
        // chance to kill neighbouring creatures
        if rand::random::<f64>() <= self.kill_prob && self.set_one_touching(x, y, "CORPSE", water_kill_mask) {
            return self.world.set_tile(x, y, "AIR");
        }

        // chance to evaporate under sky or if air to left/right or near plant
        if rand::random::<f64>() <= self.evaporate_prob &&
           (self.exposed_to_sky(x, y) ||
            self.check_tile(x - 1, y, "AIR") ||
            self.check_tile(x + 1, y, "AIR") ||
            self.touching(x, y, "PLANT", 1)) {

            return self.world.set_tile(x, y, "AIR");
        }

        // move down or diagonally down or sideways
        let bias = World::random_sign();
        return self.swap_tiles(x, y, x, y - 1, "AIR","CORPSE") ||
               self.swap_tiles(x, y, x + bias, y - 1, "AIR","CORPSE") ||
               self.swap_tiles(x, y, x - bias, y - 1, "AIR","CORPSE") ||
               self.swap_tiles(x, y, x + bias, y, "AIR","CORPSE");
    }

    fn plant_action(&mut self, x: i32, y: i32) -> bool {
        println!("plant_action");
        true
    }

    fn fungus_action(&mut self, x: i32, y: i32) -> bool {
        println!("fungus_action");
        true
    }

    fn queen_action(&mut self, x: i32, y: i32) -> bool {
        println!("queen_action");
        true
    }

    fn worker_action(&mut self, x: i32, y: i32) -> bool {
        println!("worker_action");
        true
    }

    fn pest_action(&mut self, x: i32, y: i32) -> bool {
        println!("pest_action");
        true
    }

    fn egg_action(&mut self, x: i32, y: i32) -> bool {
        println!("egg_action");
        true
    }

    fn trail_action(&mut self, x: i32, y: i32) -> bool {
        println!("trail_action");
        true
    }

    fn do_tile_action(&mut self, x: i32, y: i32) -> bool {
        println!("do_tile_action");
        // Define actions as a hashmap of String and function
        let mut actions: HashMap<String, Box<dyn Fn(&mut Self, i32, i32) -> bool>> = HashMap::new();

        actions.insert("sand".to_string(), Box::new(World::sand_action));
        actions.insert("corpse".to_string(), Box::new(World::corpse_action));
        actions.insert("water".to_string(), Box::new(World::water_action));
        actions.insert("plant".to_string(), Box::new(World::plant_action));
        actions.insert("fungus".to_string(), Box::new(World::fungus_action));
        actions.insert("queen".to_string(), Box::new(World::queen_action));
        actions.insert("worker".to_string(), Box::new(World::worker_action));
        actions.insert("pest".to_string(), Box::new(World::pest_action));
        actions.insert("egg".to_string(), Box::new(World::egg_action));
        actions.insert("trail".to_string(), Box::new(World::trail_action));

        let tile = self.get_tile(x, y).unwrap(); // TODO remove unwrap

        if let Some(action) = actions.get(&tile) {
            action(self, x, y); // Call the closure, passing self and the coordinates
            true
        } else {
            false
        }
    }

    fn worldlogic_tick(&mut self) {
        self.world_age += 1; // TODO setter function maybe better?
        let bias = rand::thread_rng().gen_bool(0.5);

        for y in 0..self.rows {
            for x in 0..self.cols {
                let dx = if bias { x } else { self.cols - 1 - x };
                self.do_tile_action(dx, y);
            }
        }
    }

    pub fn tick(&mut self) {
        self.update_chunks();

        // Tile actions
        self.worldlogic_tick();

        // Rain
        if self.age >= self.rain_freq && self.age % self.rain_freq <= self.rain_time {
            let max_rain = rand::thread_rng().gen_range(0..=5) as f64;
            let rain_progress = (self.age % self.rain_freq) as f64;
            let rain_count = (
                (rain_progress.powf(1.0) / 10000.0).min(max_rain).min(
                    (self.rain_time as f64 - rain_progress).powf(1.0) / 10000.0
                )
                * self.cols as f64
            ) / 99.0;
            self.do_rain(rain_count as f64, None);  
        }
        // Pests (never at the same time as rain)
        else if self.age >= self.pest_start && self.age % self.pest_freq == -1 {
            self.do_rain(rand::random(), Some("PEST".to_string()));  // Assuming `do_rain` takes a f64 and &str
        }
    }

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