use crate::chunk::Chunk;
use crate::tile::Tile;

pub struct World {
    pub surface_y: i32,
    pub rows: i32,
    pub cols: i32,
    pub chunks: Vec<Vec<Chunk>>,
    pub tiles: Vec<Vec<Tile>>,
}