const express = require('express')

const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;  

const db = require('./connection/db');  
const upload = require('./middlewares/fileUpload')

app.set("view engine", "hbs");
app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));
// app.use("/uploads", express.static(__dirname + "/uploads"))
app.use(express.urlencoded({extended : false}));

// let isLogin = true;

// app.use(multer())

app.use(flash())
app.use(
    session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000,  //= 2 jam 
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: 'secretValue'

}))

function getfullTime(time) {
    let month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktobebr", "November", "Desember"];

    let date = time.getDate();
  
    let monthIndex = time.getMonth();
    
    let year = time.getFullYear();
   
    let hours = time.getHours();
  
    let minutes = time.getMinutes();
  
    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
  }


app.get("/", function(request, response){

    console.log(request.session);

    response.render("home");
})

app.post("/", function(request, response){
    response.redirect("/");
})



app.get('/kliping_online', function(request, response){

    db.connect(function(err, client){
        if (err) throw err;

        client.query(`SELECT * FROM kliping_online_tb `, function(err, result){
            if (err) throw err;

            console.log(result.rows);

            let dataklipingOnline = result.rows

            dataklipingOnline = dataklipingOnline.map(function(onlineKliping){
                return {
                    ...onlineKliping,
                    postAt : getfullTime(onlineKliping.postAt),
                    isLogin : request.session.isLogin,
                    
                }
            })

            response.render("kliping_online", {isLogin: request.session.isLogin, user : request.session.user, klipingOnline : dataklipingOnline});
            
        })
    }) 
})

app.post("/kliping_online", function(request , response){

    let onlineKliping = request.body

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`INSERT INTO kliping_online_tb (titleonline, authoronline, describeonline, mediaonline, linkonline) VALUES ('${onlineKliping.titleklipingOnline}', '${onlineKliping.authorklipingOnline}', '${onlineKliping.describeklipingOnline}', '${onlineKliping.mediaklipingOnline}', '${onlineKliping.linkKliping}' )`, function (err, result){
            if (err) throw err
            
            response.redirect("/kliping_online");
          
        })
    })
})

app.get('/kliping_cetak', function(request, response){

    db.connect(function(err, client, done ){

        if (err) throw err;

        client.query(`SELECT * FROM kliping_cetak_tb`, function (err, result){
            if (err) throw err;
    
            console.log(result.rows)
            
            let datacetakKliping = result.rows;

            datacetakKliping = datacetakKliping.map(function(cetakKliping){
                return {
                    ...cetakKliping,
                    postAt : getfullTime(cetakKliping.postAt),
                    isLogin : request.session.isLogin
                }
            })
            response.render("kliping_cetak", {isLogin : request.session.isLogin, user: request.session.user, klipingCetak : datacetakKliping });
        })
    })
})

app.post("/kliping_cetak", upload.single('imageklipingCetak'), function(request , response){
    
    let cetakKliping = request.body;

    const imagecetak = request.file.filename;

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`INSERT INTO kliping_cetak_tb (titlecetak, authorcetak, mediacetak,  describecetak, imagecetak) VALUES ('${cetakKliping.titleklipingCetak}', '${cetakKliping.authorklipingCetak}', '${cetakKliping.mediaklipingCetak}' , '${cetakKliping.describeklipingCetak}', '${imagecetak}' )`, function (err, result){
            if (err) throw err;
            
            response.redirect("/kliping_cetak");
        })
    })

})    

app.get("/release_online", function(request, response){

    db.connect(function(err, client, done ){

        if (err) throw err;

        client.query(`SELECT * FROM release_tb`, function (err, result){
            if (err) throw err;

            console.log(result.rows);

            let dataRelease = result.rows;

            dataRelease = dataRelease.map(function(releaseData){
                return {
                    ...releaseData,
                    postAt : getfullTime(releaseData.postAt),
                    isLogin : request.session.isLogin
                }
            })

            response.render("release_online", {isLogin : request.session.isLogin, user: request.session.user, releaseOnline : dataRelease});
        })
    })

})

app.post("/release_online", upload.single('imageRelease'), function(request, response){
    
   
    let release = request.body

    let image = request.file.filename;

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`INSERT INTO release_tb(author, title, describe, image) VALUES ('${release.authorRelease}', '${release.titleRelease}' , '${release.describeRelease}',  '${image}' )`, function (err, result){
            if (err) throw err;
            
            response.redirect("/release_online");
          
        })
    
    })
})


app.get("/details-release/:id", function(request, response){
   
    let idRelease = request.params.id

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`SELECT * FROM release_tb WHERE id = ${idRelease}`, function (err, result){
            if (err) throw err;
            
            let dataRelease = result.rows[0];

            console.log(dataRelease);
            
            response.render("details-release", {release : dataRelease})
        })
    
    })

})

app.post("/details-release", function(request, response){
    response.redirect("/details-release");
})

app.get("/details-kliping/:id", function(request, response){
    // response.render("details-kliping");
    let klipingonlineId = request.params.id

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`SELECT * FROM kliping_online_tb WHERE id = ${klipingonlineId}`, function (err, result){
            if (err) throw err;
            
            let dataklipingOnline = result.rows[0];
            
            console.log(dataklipingOnline);
            
            response.render("details-kliping", {onlineKliping : dataklipingOnline})
        })
    
    })

})


app.post("/details-kliping", function(request, response){
    response.redirect("/details-kliping");
})

app.get("/details-kliping-cetak/:id", function(request, response){

    let klipingCetakId = request.params.id

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(`SELECT * FROM kliping_cetak_tb WHERE id = ${klipingCetakId}`, function (err, result){
            if (err) throw err;
            
            let datacetakKliping = result.rows[0];
            
            console.log(datacetakKliping);
            
            response.render("details-kliping-cetak", {klipingCetak : datacetakKliping})
        })
    
    })

})

app.post("/details-kliping-cetak", function(request, response){
    response.redirect("/details-kliping-cetak");
})

app.get("/add-release", function(request, response){
    console.log(request.session.isLogin)

    if (!request.session.isLogin) {

        request.flash('danger', "please Login, Thanks_")
    
        return response.redirect('/login');
    }

    response.render("add-release");
})

app.post("/add-release", function(request, response){
    response.redirect("/add-release");
})

app.get("/add-kliping-cetak", function(request, response){
    if (!request.session.isLogin) {

        request.flash('danger', "please Login, Thanks_")
    
        return response.redirect('/login');
    }

    response.render("add-kliping-cetak");
})

app.post("/add-kliping-cetak", function(request, response){
    response.redirect("/add-kliping-cetak");
})

app.get("/add-kliping-online", function(request, response){
   console.log(request.session.isLogin);

   if(!request.session.isLogin) {

       request.flash('danger', "please Login, Thanks_")
    
       return response.redirect('/login');
   }

    response.render("add-kliping-online");
})

app.post("/add-kliping-online", function(request, response){
    response.redirect("/add-kliping-online");
})


app.get("/login", function(request, response){
    response.render("login");
})


app.post("/login", function(request, response){


    console.log(request.body);

    const {inputEmail, inputPassword} = request.body;

    let query = `SELECT * FROM tb_user WHERE email = '${inputEmail}'`

    db.connect(function(err, client, done){
        if (err) throw err;

        client.query(query, function(err, result){
            if(err) throw err

            console.log(result.rows.length);

            if (result.rows.length == 0){

                request.flash('danger', 'Maaf Email Anda Belum Terdaftar')

                return response.redirect('/login')
            }
            const isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)
              

                if (isMatch) {
                    request.session.isLogin = true;
                    request.session.user = {
                        id: result.rows[0].id,
                        email: result.rows[0].email
                    }

                    request.flash('success', 'Login Success')
                    response.redirect('/')
                } else {
                    request.flash('danger', ' Sorry, Email and Password Dont Match')
                    response.redirect('/login')
                    
            };
        });
    });
});

app.get("/contact", function(req, response){
    response.render("contact");
})


app.get("/galery", function(request, response){
    response.render("galery");
})

app.post("/galery", function(request, response){
    response.redirect("/galery");
})

app.get("/about", function(request, response){
    response.render("about");
})



app.get("/deleteRelease/:id", function(request, response){

    
    if (!request.session.isLogin) {

        request.flash('danger', "please Login, Thanks_")
    
        return response.redirect('/login');
    }

    let id = request.params.id;

    let query = `DELETE FROM release_tb WHERE id  = ${id}`

    db.connect(function (err, client, result) {
        if (err) throw err

    client.query(query, function(err, result){
        if (err) throw err

        response.redirect("/release_online")
    })
        
    })

    // releaseOnline.splice(index, 1);

    // console.log(index);
  
    // response.redirect("/release_online");
})

app.get("/deleteklipingOnline/:id", function(request, response){

    
    if (!request.session.isLogin) {

        request.flash('danger', "please Login, Thanks_")
    
        return response.redirect('/login');
    }


    let id = request.params.id;

    let query = `DELETE FROM kliping_online_tb WHERE id  = ${id}`

    db.connect(function (err, client, result) {
        if (err) throw err

    client.query(query, function(err, result){
        if (err) throw err

        response.redirect("/kliping_online")
    })
    })
    // klipingOnline.splice(index, 1);

    // console.log(index)
    // response.redirect("/kliping_online")
})

app.get("/deleteklipingCetak/:id", function(request, response){


    if (!request.session.isLogin) {

        request.flash('danger', "please Login, Thanks_")
    
        return response.redirect('/login');
    }

    // klipingCetak.splice(index, 1)

    // console.log(index);
    let id = request.params.id;

    let query = `DELETE FROM kliping_cetak_tb WHERE id  = ${id}`

    db.connect(function (err, client, result) {
        if (err) throw err

    client.query(query, function(err, result){
        if (err) throw err


        response.redirect("/kliping_cetak")
    })
        
    })
})

app.get("/logout", function(request, response){
    request.session.destroy();

    response.redirect("/")
})

app.listen(PORT, function(){
    console.log(`server is running this port : ${PORT}`)
})