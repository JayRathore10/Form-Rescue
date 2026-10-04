import { authRouter } from "./routes/auth.routes";
import { aiRouter } from "./routes/ai.routes";
import { fileRouter } from "./routes/file.uplaod";
import ocrRoute from "./routes/ocr.routes";
import express  , {Request , Response} from "express";

const app = express();

app.use(express.json());

app.use("/uploads",express.static("uploads"));

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/ai" , aiRouter);
app.use("/api/v1/ocr", ocrRoute);


app.use("/api/v1/file",fileRouter)
app.get("/", (req: Request, res: Response) => {
  res.send("Jexts server is running!");
});

export default app;
