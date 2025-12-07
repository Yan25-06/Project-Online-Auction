import type { Application } from "express";
import { exampleRouter } from "../routes/example.route.js"; 

export const setupRoute = (app:Application) => {
    app.use(exampleRouter);
}