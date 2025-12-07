import { Router } from "express"; 
import { getExampleController } from "../controllers/example.controller.js";


const exampleRouter = Router();  

exampleRouter.get("/example", getExampleController);


export { exampleRouter };