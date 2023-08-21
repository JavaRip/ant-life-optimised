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

pub trait ChunkExt {
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
