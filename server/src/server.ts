import { connectDb } from "./configs/db.config";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async() => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectDb();
});