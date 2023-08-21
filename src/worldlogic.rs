pub trait WorldInterface {
    // Put method signatures here that Worldlogic needs from World
}

#[derive(Clone)]
pub struct Worldlogic<W: WorldInterface> {
    world: W,  
}

impl<W: WorldInterface> Worldlogic<W> {
    pub fn new_uninitialized() -> Self {
        panic!("Worldlogic is uninitialized")
    }

    pub fn new(world: W) -> Self {
        Worldlogic { world }
    }
    
    pub fn tick(&mut self) {
        println!("tick");
    }
}
        // self.world.age += 1;

        // // Randomly alternate left-to-right and right-to-left to avoid turn-order bias
        // let bias = rand::random::<bool>();

        // for y in 0..self.world.rows {
        //     for x in 0..self.world.cols {
        //         let dx = if bias { x } else { self.world.cols - 1 - x };
        //         self._do_tile_action(dx, y);
        //     }
        // }
    // }

    // fn _do_tile_action(&self, x: usize, y: usize) -> bool;

    // fn _sand_action(&mut self, x: usize, y: usize) -> bool;

    // fn _corpse_action(&mut self, x: usize, y: usize) -> bool;

    // fn _water_action(&mut self, x: usize, y: usize) -> bool;

    // fn _plant_action(&mut self, x: usize, y: usize) -> Option<()>;

    // fn _fungus_action(&mut self, x: usize, y: usize) -> Option<()>;

    // fn _queen_action(&mut self, x: usize, y: usize) -> bool;

    // fn _worker_action(&mut self, x: usize, y: usize) -> bool;

    // fn _pest_action(&mut self, x: usize, y: usize) -> bool;

    // fn _egg_action(&mut self, x: usize, y: usize) -> bool;

    // fn _trail_action(&mut self, x: usize, y: usize) -> bool;

    // fn _climbable(&self, x: usize, y: usize) -> bool;

    // fn _move_random(&mut self, x: usize, y: usize, mask: &str, push_mask: Option<&str>) -> bool;

    // fn _exposed_to_sky(&self, x: usize, y: usize) -> bool;

    // fn _touching(&self, x: usize, y: usize, mask: &str, radius: usize) -> usize;

    // fn _touching_which(&self, x: usize, y: usize, mask: &str, radius: usize) -> Vec<(usize, usize)>;

    // fn _set_one_touching(&mut self, x: usize, y: usize, tile: &str, mask: &str) -> bool;

    // fn _search_for_tile(&self, x: usize, y: usize, target: &str, range: usize, walk_mask: &str) -> bool;
// }
