import client from "./database.js";
import express, { query } from "express";
import bodyParser from "body-parser";
import validator from "validator";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", async (req,res) => {
    try {
        let query = "SELECT * FROM ToDo ORDER BY 1";
        const result = await client.query(query);
        res.render("index.ejs", {
            rows: result.rows,
            task: null,
        });
    } catch (error) {
        console.log(Error.message);
    }
});

app.get("/:customList", async (req,res) => {
    const list = req.params.customList;
    const heute = new Date();
    let nextWeek = new Date(heute);
    nextWeek.setDate(heute.getDate()+7);
    let query = "";
    let result;
    try {
        if(list === "today"){
            query = "SELECT * FROM ToDo WHERE date = $1 ORDER BY 1";
            result = await client.query(query, [heute]);
        } else if(list === "upcoming") {
            query = "SELECT * FROM ToDo WHERE date BETWEEN $1 AND $2 ORDER BY 1";
            result = await client.query(query, [heute,nextWeek]);
        } else if(list === "priority") {
            query = "SELECT * FROM ToDo WHERE priority";
            result = await client.query(query);
        }
        res.render("index.ejs", {
            rows: result.rows || null
        });
    } catch (error) {
        console.log(Error.message);
    }
});

app.post("/data", async (req,res) => {
    const task = (req.body.task.length > 2) ? req.body.task : null;
    const priority = req.body.priority || null;
    const date = req.body.date || new Date();
    try {
        let query = "SELECT AddToDo($1,$2,FALSE,$3);";
        const result = await client.query(query,[task,priority,date]);
        res.redirect("/");
        console.log("ToDo added!");
    } catch (error) {
        console.log(error.message);
    }
});

app.get("/edit/:id", async (req,res) => {
    const id = req.params.id;
    try {
        let query = "SELECT * FROM ToDo ORDER BY 1";
        const rowresult = await client.query("SELECT * FROM ToDo WHERE id = $1", [id]);
        const result = await client.query(query);

        
        res.render("index.ejs", {
            rows: result.rows,
            task: rowresult.rows[0],
        });
    } catch (error) {
        console.log(Error.message);
    }
});

app.post("/delete/:id", async (req,res) => {
    const id = parseInt(req.params.id);
    try {
        await client.query("DELETE FROM ToDo WHERE id = $1", [id]);
        res.redirect("/");
        console.log("ToDo deleted!");
    } catch (error) {
        console.error(error.message);
    }
});

app.post("/edit/:id", async (req,res) => {
    const id = parseInt(req.params.id);
    const task = req.body.task;
    const description = req.body.description;
    const priority = req.body.priority;
    const date = req.body.date;
    console.log(id,task,description,priority,date);
    try {
        const params = [id,task,description,priority,date];
        await client.query("SELECT UpdateToDo($1,$2,$3,$4,$5)", params);
        res.redirect("/");
    } catch (error) {
        console.error(error.message);
    }
});

app.post("/done/:id", async (req,res) => {
    const id = parseInt(req.params.id);
    const checked = req.body.is_done;
    console.log(checked);
    try {
        await client.query("SELECT checked($1,$2)",[checked,id]);
        res.redirect("/");
        console.log("Checked!");
        console.table((await client.query('SELECT * FROM ToDO')).rows);
    } catch (error) {
        console.error(error.message);
    }
});

app.listen(port, 
    console.log(`Server is running on Port ${port}`)
    );