import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/assignments", async (req, res) => {
  let results;
  try{
    results =  await connectionPool.query();
  } catch {
    return res.status(500).json({
      "message": "Server could not create assignment because database connection",
  } );
  }
  return res.status(200).json({
      data: results.rows,
  });
});

app.get("/assignments/:assignmentsId", async (req,res) => {
  const assignmentsIdFromClient = req.params.assignmentstId
  const results = await connectionPool.query(`
      select * from assignments where assignments_id=$1`,
      [assignmentsIdFromClient]
  );
  if(!results.rows[0]) {
      return res.status(404).json({
          message: "Server could not find a requested assignment" 
      });
  }
      return res.status(200).json({
      data: results.rows[0],
      });
});

app.post("/assignments", async (req, res) => {

    const newAssignment = {
         ...req.body,
         created_at: new Date(),
         updated_at: new Date(),
         published_at: new Date()
     };
try {
     await connectionPool.query(
         `insert into assignments (assignment_id, title, content, category, length, user_id, status, created_at, updated_at, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
         [
            newAssignment.assignment_id,
            newAssignment.title,
            newAssignment.content,
            newAssignment.category,
            newAssignment.length,
            newAssignment.user_id,
            newAssignment.status,
            newAssignment.created_at,
            newAssignment.updated_at,
            newAssignment.published_at
         ]
     );
    } catch {
      return res.status(404).json({
        "message": "Server could not find a requested assignment",
    } );
    } 
     return res.status(200).json({
         message: "Created assignment sucessfully",
     });
 });

app.put("/assignments/:assignmentId",async (req,res) => {
  const assignmentsIdFromClient = req.params.assignmentsId;
  const updatedAssignments = { ...req.body, updated_at: new Date()};
  try {
  await connectionPool.query (
      `
      update assignments
      set title = $2,
          content = $3,
          category = $4,
          length =$5,
          status =$6,
          updated_at =$7
      where assignment_id = $1
      `,
      [
        assignmentsIdFromClient,
        updatedAssignments.title,
        updatedAssignments.content,
        updatedAssignments.category,
        updatedAssignments.length,
        updatedAssignments.status,
        updatedAssignments.updated_at,
      ]
  );
} catch {
  return res.status(404).json({
    "message": "Server could not find a requested assignment to update",
} );
}
  return res.status(200).json({
      message: "Updated assignment sucessfully",
  });
});

app.delete("/assignments/:assignmentId",async (req,res) => {
  const assignmentsIdFromClient = req.params.postId;
  try {
  await connectionPool.query (
      `delete from posts
      where assignments_id = $1`,
      [assignmentsIdFromClient]
  );
} catch {
  return res.status(404).json({
    "message": "Server could not find a requested assignment to delete",
} );
}
  return res.status(200).json({
      message: "Deleted assignment sucessfully",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});