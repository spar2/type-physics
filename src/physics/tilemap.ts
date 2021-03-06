import Vec2 from "./vec2";
import Rectangle from "./rectangle";
import Body from "./body";
import Collidable from "./collidable";

export default class Tilemap extends Collidable {

   public mapSize: Vec2;
   public tileSize: Vec2;

   private collisionMap: boolean[][];

   public constructor(pos: Vec2, mapSize: Vec2, tileSize: Vec2) {
      super();

      this.bounds = new Rectangle(pos.x, pos.y, mapSize.x * tileSize.x, mapSize.y * tileSize.y);
      this.mapSize = mapSize;
      this.tileSize = tileSize;

      this.collisionMap = [];
      for (let y = 0; y < mapSize.y; y++) {
         this.collisionMap[y] = [];
         for (let x = 0; x < mapSize.x; x++) {
            this.collisionMap[y][x] = false;
         }
      }
   }

   private inLocalBounds(position: Vec2): boolean {
      return position.x >= 0 && position.x < this.mapSize.x &&
         position.y >= 0 && position.y < this.mapSize.y;
   }
   private worldCoordsToLocalCoords(position: Vec2): (Vec2) {
      let x = Math.floor((position.x - this.bounds.x) / this.tileSize.x);
      let y = Math.floor((position.y - this.bounds.y) / this.tileSize.y);
      return new Vec2(x, y);
   }
   private localCoordsToWorldCoords(position: Vec2): (Vec2) {
      let x = (position.x * this.tileSize.x) + this.bounds.x;
      let y = (position.y * this.tileSize.y) + this.bounds.y;
      return new Vec2(x, y)
   }

   public getTileAtWorldCoords(position: Vec2): boolean {
      return this.getTileAtLocalCoords(this.worldCoordsToLocalCoords(position));
   }
   public getTileAtLocalCoords(position: Vec2): boolean {
      if (this.inLocalBounds(position)) {
         return this.collisionMap[position.y][position.x];
      } else {
         return null;
      }
   }

   public setTileAtWorldCoords(position: Vec2, collide: boolean): void {
      this.setTileAtLocalCoords(this.worldCoordsToLocalCoords(position), collide);
   }
   public setTileAtLocalCoords(position: Vec2, collide: boolean): void {
      if (this.inLocalBounds(position)) {
         this.collisionMap[position.y][position.x] = collide;
      }
   }

   public getRectangles(): Rectangle[] {
      let rectangles: Rectangle[] = [];
      for (let y = 0; y < this.mapSize.y; y++) {
         for (let x = 0; x < this.mapSize.x; x++) {
            let localCoords = new Vec2(x, y);
            if (this.getTileAtLocalCoords(localCoords)) {
               let worldCoords = this.localCoordsToWorldCoords(localCoords);
               rectangles.push(new Rectangle(worldCoords.x, worldCoords.y, this.tileSize.x, this.tileSize.y))
            }
         }
      }
      return rectangles;
   }

   public getBodiesInWorldRect(rect: Rectangle): Body[] {
      let min = this.worldCoordsToLocalCoords(rect.position);
      let max = this.worldCoordsToLocalCoords(rect.position.add(rect.dimension));
      let bodies: Body[] = [];

      for (let y = min.y; y <= max.y; y++) {
         for (let x = min.x; x <= max.x; x++) {
            let localCoords = new Vec2(x, y);
            let worldCoords = this.localCoordsToWorldCoords(localCoords);
            let tile = this.getTileAtLocalCoords(localCoords);
            if (tile) {
               // Create body
               let body = new Body(worldCoords, new Vec2(0, 0), this.tileSize);
               body.moveable = false;

               // Get each adjacent tile
               let leftTile = this.getTileAtLocalCoords(localCoords.add(new Vec2(-1, 0)));
               let rightTile = this.getTileAtLocalCoords(localCoords.add(new Vec2(1, 0)));
               let topTile = this.getTileAtLocalCoords(localCoords.add(new Vec2(0, -1)));
               let bottomTile = this.getTileAtLocalCoords(localCoords.add(new Vec2(0, 1)));

               // Set collision directions
               body.collideDirections.left = !leftTile;
               body.collideDirections.right = !rightTile;
               body.collideDirections.top = !topTile;
               body.collideDirections.bottom = !bottomTile;

               bodies.push(body);
            }
         }
      }
      return bodies;
   }
}