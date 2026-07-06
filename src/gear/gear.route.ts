import { Router } from "express";
import { gearController } from "./gear.controller";

const route = Router();

route.get("/", gearController.getAllGear);
route.get("/:id", gearController.getSingleGear);

export const gearRouter = route;