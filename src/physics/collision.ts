import Vec2 from "./vec2";
import Collidable from "./collidable";

export default class Collision {
   public other: Collidable;
   public normal: Vec2;
   public force: number;
}