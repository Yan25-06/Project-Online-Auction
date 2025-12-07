import type { Request, Response } from "express";
import { exampleModel } from "../models/example.model.js"; 


export const getExampleController = (req:Request, res:Response) => {
    const data = exampleModel.getExampleData();
    res.json(data);
}