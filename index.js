const express= require('express');
const app= express();
const port=5000;
const path= require('path');
const mysql= require('mysql2');


// Database Connection 
const conn= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'Attendence_Management',
    password: 'mysql@2006'
});

try{
    conn.query("SHOW TABLES", (err,result)=>{
        if(err) throw err;
        console.log(result)
    })
}
catch(err){
    console.log(err);
}

app.set('views', path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/css")))

app.get("", (req, res)=>{
    res.render('teacher_login.ejs');
})

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.post("/teacher_details", (req, res)=>{
    let {Teacher_Id:sampleTeacher_id, Password:samplePassword}= req.body;

    console.log(`teacher id ${sampleTeacher_id}`);
    console.log(`password ${samplePassword}`);
    // // DataBase

    
    let q=`Select * From teacher where Teacher_id= ?`;
    try{
        conn.query(q, [sampleTeacher_id],(err, result)=>{
            if(err) throw err;

            if(result.length > 0){
                console.log(result.length);
                console.log('Got Id');
                // console.log(`From DB ${typeof(result[0].Teacher_Id)}`);
                // console.log(`From DB ${typeof(result[0].Password)}`)
                // console.log(`sample pass: ${typeof(samplePassword)}`);


                // Validation of password
                if(samplePassword==result[0].Password){
                    console.log("Password is correct you can take attendence")/
                    // res.send("here is your detail ")
                    res.render("teacher_details.ejs",{ name: result[0].Name,
                                Teacher_Id: result[0].Teacher_Id,
                                Phone_No: result[0].Phone_No});
                }
                else{
                    console.log("incorrect password")
                }
                
            }
            else{
                console.log("Not got the id")
            }
                
        })


    }
    catch(err){
            console.log("Error")
    }
})

app.get('/', (req, res)=>{
    res.send("Welcome to IIT Ranchi")
})


// Attendence form 
app.post("/teacher_details/Attendence_form", (req, res)=>{
    let {Teacher_Id}= req.body;
    console.log("Teacher_Id received:", Teacher_Id);

    // q=`SELECT Name from teacher where Teacher_id= ?`
    q=`SELECT t.Teacher_ID, t.Name, CONCAT(b.StartYear, '-', b.EndYear) As Batch, c.courseName, s.sectionName
        from teacher_assignment as a
        JOIN teacher as t 
            ON t.Teacher_ID= a.Teacher_Id
        JOIN Batch as b
            ON b.BatchId = a.BatchId
        JOIN Course as c
            ON c.CourseId= a.courseId
        JOIN Section as s 
            ON s.SectionId= a.SectionId
        WHERE a.Teacher_Id= ?`

    try{
        conn.query(q,[Teacher_Id],(err, result)=>{
            if(err) throw err;
            Batches=[]
                for(let i of result){
                    Batches.push(i.Batch);
                }
            courses=[]
                for(let i of result){
                    courses.push(i.courseName);
                }
            sections=[];
                for(let i of result){
                    sections.push(i.sectionName)
                }
            console.log(Batches);
            console.log(sections);
            console.log(courses);

            res.render("Attendence_form.ejs", {name: result[0].Name,
                                                Batches,sections,courses                                
            });
        })
    }catch(err){
        console.log(err);
    }
})

// server
app.listen(port, ()=>{
    console.log(`app is listening at port ${port}`);
})