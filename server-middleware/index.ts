import * as dotenv from 'dotenv'
dotenv.config()
import express from "express";
const app = express();
import fs from 'fs';
import mysql, { RowDataPacket } from "mysql2";

import session from 'express-session';
import mysqlSession from 'express-mysql-session'
import {Parser} from 'json2csv'
import multer from 'multer'
const MySQLStore = mysqlSession(session)


//types, to move away into another file when ready
export type AccessType = "EMPLOYEE" | "MANAGER" | "HR"
export type FailureType = "FAILURE" | "SUCCESS"

declare module 'express-session' { //DECLARE YOUR SEESSION VARIABLES HERE TO PASS TYPESCRIPT
    interface SessionData {
      user: any;
    }
  }

//sql connection here
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: "root",
    //password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

var sessionStore = new MySQLStore({}/* session store options */, pool.promise());
  
//TODO: USE SECURE COKIES WITH HTTPS, THIS IS INSECURE CoOKIES (sess.cookie.secure)
app.use(session({
	secret: 'bbbbbb',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));
app.use(express.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, req.session.user + "_" + req.body.file_type + "_" + file.originalname + "_" + Date.now())
    }
})
//pls do not app.use the multer, or every single request enables uploading, use only as middleware
var upload = multer({ storage: storage })

//send user data here
app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        console.log("user not logged in")
        res.json({
            result: "failure",
          })
        return
    }
    console.log("got user")
    console.table(req.session.user)
    res.json({
        result: "success",
        message: "welcome " + req.session.user,
    })
})



//FUNCTIONAL REQUIREMENT 1: LOG INTO PORTAL
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: will enter their email address and password into the login page on the web portal and 
 * OUTPUT: subsequently gain access to the HR portal.
*/
//[POST] /server-api/login {USER: string, PASSWORD: string} [ACCESS_TYPE >= 0]
app.post("/login", async (req, res) => { 
    console.log("post login " + JSON.stringify(req.body))

    const pPool = pool.promise();

    //TODO: BCRYPT req.body.pass
    const [rows, fields] = await pPool.execute("SELECT * from `accounts` WHERE `username` = ? AND `password` = ?", [req.body.user, req.body.pass])

    if ((rows as RowDataPacket[]).length > 0) {
        console.log("has rows")
        req.session.user = rows[0].account_id; //store only acc id in the session
        res.json({
            result: "success"
        });
    }
    else {
        console.log("No account with name found!")
        res.json({
            result: "failure"
        });
    }
})

//FUNCTIONAL REQUIREMENT 2: VIEW PERSONAL PAYROLL
//FUNCTIONAL REQUIREMENT 3: Viewing of Employee’s payroll
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: after logging into the portal.
 * OUTPUT: can view each of their personal payroll, 
 */

//[GET] /server-api/view_payroll_all {OTHER_USER?: number} [ACCESS_TYPE >= 0 || ACCESS_TYPE == 2]
//@returns message: all rows if success
app.get("/view_payroll_all", async (req, res) => {
    
    if (req.session.user != null) { 
        const pPool = pool.promise();
        //employees and managers
        if (req.body.other_user != null) {
            //check if HR(2)
            const [rows1, fields1] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ?", [req.session.user])
            if ((rows1 as RowDataPacket[]).length > 0) {
                console.log("has rows")

                if (rows1[0].access_type == 2) {
                    const [rows2, fields2] = await pPool.execute("SELECT * from `payroll` WHERE `account_id` = ?", [req.body.other_user])
                    res.json({
                        result: "success",
                        message: JSON.stringify(rows2) //TODO: do we send all the data over?client side will store all the payroll this way
                    });
                }
                else {
                    res.json({
                        result: "failure",
                        message: "not a HR"
                    });
                }
            }
        }

        else { 
            const [rows, fields] = await pPool.execute("SELECT * from `payroll` WHERE `account_id` = ?", [req.session.user])

            if ((rows as RowDataPacket[]).length > 0) {
                console.log("has rows")
                res.json({
                    result: "success",
                    message: JSON.stringify(rows) //TODO: do we send all the data over?client side will store all the payroll this way
                });
            }
            else {
                console.log("No account with name found!")
                res.json({
                    result: "failure",
                    message: "no money?"
                });
            }
        }
        
    }
    else { 
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
    
})

//FUNCTIONAL REQUIREMENT 4: Editing of Employee’s payroll
/** USER TYPE: As the HR that   
 * INPUT: disseminates the monthly pay, they will have the rights to make necessary
 * OUTPUT: amendments to the payrolls.
 */

//[GET] /server-api/view_payroll_all {OTHER_USER: number, NEW_AMOUNT: number} [ACCESS_TYPE == 2]
//@returns result: success if succeeded
app.get("/edit_payroll", async (req, res) => {
    
    if (req.session.user != null) { 
        const pPool = pool.promise();
        //employees and managers
        if (req.body.other_user != null) {
            //check if HR(2)
            const [rows1, fields1] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ?", [req.session.user]) //TODO: if not lazy, move check access to a new function
            if ((rows1 as RowDataPacket[]).length > 0) {
                console.log("has rows")

                if (rows1[0].access_type == 2) {
                    const [rows2, fields2] = await pPool.execute("UPDATE `payroll` SET `amount` = ? WHERE `account_id` = ?", [req.body.new_amount, req.body.other_user])
                    res.json({
                        result: "success",
                    });
                }
                else {
                    res.json({
                        result: "failure",
                        message: "not a HR"
                    });
                }
            }
        }
    }
    else { 
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
    
})

app.get("/", (req, res) => {
    res.json({
        message: "",
    })
})

//FUNCTIONAL REQUIREMENT 5: Upload Personal Medical Certificate (MC)
//FUNCTIONAL REQUIREMENT 8: Upload Personal Receipt
//FUNCTIONAL REQUIREMENT 14: Uploading of Job Applicant’s Resume
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: after logging into the portal.
 * OUTPUT: can upload mc and receipt, 
 */
//[POST] /server-api/upload {FILE_TYPE: number, FILE_DATA: any} [ACCESS_TYPE >= 0]
//@returns message: success
app.get("/upload", async (req, res) => {
    
    if (req.body.user != null) { 
        upload.single('file_data')(req, res, err => {
            //employees and managers
            if (err) {
                //TODO: store these files securely? wad kind of file was uploaded?
                res.json({
                    result: "failure",
                    message: "success"
                });
            }
            else {
                res.json({
                    result: "success",
                    message: "success"
                });
            }
        })
        
    }
    else { 
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
    
})

//FUNCTIONAL REQUIREMENT 6: Viewing of Personal Medical Certificate
//FUNCTIONAL REQUIREMENT 7: Viewing of Other Employees Medical Certificate
//FUNCTIONAL REQUIREMENT 9: View Personal Receipt
//FUNCTIONAL REQUIREMENT 10: Viewing of Other Employees Receipts
//FUNCTIONAL REQUIREMENT 13: Viewing of Job Applicant’s resume
//FUNCTIONAL REQUIREMENT 15: Downloading of Job Applicant’s Resume [NOTE: downloading is client side through the PDF viewer]
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: after logging into the portal.
 * OUTPUT: can view self and others, 
 */
//[GET] /server-api/view_uploads {OTHER_USER?: number, FILE_TYPE: number} [ACCESS_TYPE >= 0 || ACCESS_TYPE == 2]
//@returns res.send(image) or res.send(pdf)
app.get("/view_uploads", async (req, res) => {
    console.log("post upload " + JSON.stringify(req.body))

    if (req.session.user != null ) {
        if (req.body.other_user != null) {
            const pPool = pool.promise();

            //check if you are HR(2)
            const [rows, fields] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ?", [req.session.user])
            if (rows[0].access_type == 2) {
                //TODO: can access others
                //read everything in the upload file
                let filelist: string[] = []
                fs.readdir("./uploads", (err, files) => {
                    files.forEach(file => {
                      filelist.push(file); //sends every single persons uploads, then later on group in the client side
                    });
                });
    
                res.json({
                    result: "success",
                    message: JSON.stringify(filelist) //TODO: check if need stringify. sends filename. to request viewing a single opload, use /view_upload
                })
            }
            else {
                res.json({
                    result: "failure",
                    message: "not a HR"
                })
            }
        }
        else {
            let filelist: string[] = []
            fs.readdir("./uploads", (err, files) => {
                files.forEach(file => {
                    var value = file.indexOf(req.session.user);
                    var check = req.session.user + "" //TODO: probably need a better way? maybe?
                    if (value != -1 && value < check.length)
                        filelist.push(file);
                });
            });

            res.json({
                result: "success",
                message: JSON.stringify(filelist) //TODO: check if need stringify
            })
        }
        
    }

    res.json({
        result: "success"
      });
})

//FUNCTIONAL REQUIREMENT 11: Downloading of Personal Payroll
//FUNCTIONAL REQUIREMENT 12: Downloading of Other Employees’ Payroll
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: after logging into the portal.
 * OUTPUT: can download their own personal payroll, 
 */

//[GET] /server-api/download_payroll {OTHER_USER?: number, PAYROLL_ID: number} [ACCESS_TYPE >= 0 || ACCESS_TYPE == 2]
//@returns message: all rows if success
app.get("/download_payroll", async (req, res) => {
    
    if (req.session.user != null) { 
        const pPool = pool.promise();
        //employees and managers
        if (req.body.other_user != null) {
            //check if HR(2)
            const [rows1, fields1] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ?", [req.session.user])
            if ((rows1 as RowDataPacket[]).length > 0) {
                console.log("has rows")

                if (rows1[0].access_type == 2) {
                    const [rows2, fields2] = await pPool.execute("SELECT * from `payroll` WHERE `account_id` = ? AND `payroll_id` = ?", [req.body.other_user, req.body.payroll_id])
                    res.json({
                        result: "success",
                        message: JSON.stringify(rows2) //TODO: 
                    });
                }
                else {
                    res.json({
                        result: "failure",
                        message: "not a HR"
                    });
                }
            }
        }

        else { 
            const [rows, fields] = await pPool.execute("SELECT * from `payroll` WHERE `account_id` = ? AND `payroll_id` = ?", [req.session.user, req.body.payroll_id])

            if ((rows as RowDataPacket[]).length > 0) {
                console.log("has rows")

                res.json({
                    result: "success",
                    message: JSON.stringify(rows) //TODO: we convert this into a file, or we convert this data to a file in the client side
                });
            }
            else {
                console.log("No account with name found!")
                res.json({
                    result: "failure",
                    message: "no money?"
                });
            }
        }
        
    }
    else { 
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
    
})

//FUNCTIONAL REQUIREMENT 16.1: HR will be able to add new Employee and Manager accounts
//[POST] /server-api/register {USER:string, PASSWORD: string, ACCESS_TYPE: number, NAME: string, ADDRESS: string, PAYROLL_ACCOUNT: string} [ACCESS_TYPE == 2]
app.post("/register", async (req, res) => {
    console.log("post register " + JSON.stringify(req.body))
    if (req.session.user != null) {
        const pPool = pool.promise();

        //check if you are HR(2)
        const [rows, fields] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ? ", [req.session.user])
        if (rows[0].access_type == 2) {

            //TODO: bcrypt
            const [rows2, fields2] = await pPool.execute("INSERT INTO `accounts`(username, password, access_type, address, payroll_account, name) VALUES (?,?,?,?,?,?)", [req.body.user, req.body.password, req.body.access_type, req.body.address, req.body.payroll_account, req.body.name])
            res.json({
                result: "success",
            })
        }
        else {
            res.json({
                result: "failure",
                message: "not a HR"
            })
        }
    }

    res.json({
        result: "success"
      });
})

//FUNCTIONAL REQUIREMENT 16.2 HR will be able to disable accounts to put them in an inactive state.
//[POST] /server-api/register {ACCOUNT_ID:number, ACTIVE: number} [ACCESS_TYPE == 2]
app.post("/set_active", async (req, res) => {
    console.log("post active " + JSON.stringify(req.body))
    if (req.session.user != null) {
        const pPool = pool.promise();

        //check if you are HR(2)
        const [rows, fields] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ? ", [req.session.user])
        if (rows[0].access_type == 2) {

            //TODO: check if ACTIVE is 0 (disable) or 1 (enable)
            const [rows2, fields2] = await pPool.execute("UPDATE `accounts` SET `active` = ? WHERE `account_id` = ?", [req.body.active, req.session.user])

            res.json({
                result: "success",
            })
        }
        else {
            res.json({
                result: "failure",
                message: "not a HR"
            })
        }
    }

    res.json({
        result: "success"
      });
})

//FUNCTIONAL REQUIREMENT 17: RESET OWN CREDENTIALS
/** USER TYPE: Employees, Managers and HR Personnel
 * INPUT will be able to reset their own passwords.
 * OUTPUT will be able to reset their own passwords.
*/

//[POST] /server-api/reset_password {OLD_PASSWORD: string, NEW_PASSWORD: string} [ACCESS_TYPE >= 0]
app.post("/reset_password", async (req, res) => {
    if (req.session.user != null) {
        const pPool = pool.promise();

        //check correct password
        const [rows, fields] = await pPool.execute("SELECT * from `accounts` WHERE `account_id` = ? ", [req.session.user])
        if (rows[0].password == req.body.old_password) { //TODO: bcrpyt
            //TODO: bcypyrt
            const [rows2, fields2] = await pPool.execute("UPDATE `accounts` SET `password` = ? WHERE `account_id` = ?", [req.body.new_password, req.session.user])
            res.json({
                result: "success",
            })
        }
        else {
            res.json({
                result: "failure",
                message: "wrong old password"
            })
        }
        
    }
    else {
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
  })


//FUNCTIONAL REQUIREMENT 18: UPDATE OWN PROFILE
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: by changing information such as their address, payroll account, etc..
 * OUTPUT: will be able to update their profile 
*/
//[POST] /server-api/update_profile {NAME?: string, ADDRESS?: string, PAYROLL_ACCOUNT?: string} [ACCESS_TYPE >= 0]
app.post("/update_profile", async (req, res) => {
    console.log("post update profile " + JSON.stringify(req.body))

    if (req.session.user != null) {
        const pPool = pool.promise();

        //TODO: check which field is null or something
        const [rows, fields] = await pPool.execute("UPDATE `accounts` SET `name` = ?, `address` = ?, `payroll_account` = ? WHERE `account_id` = ?", ["das", "asd", "Asd", req.session.user])

        res.json({
            result: "success",
        })
    }
    else {
        res.json({
            result: "failure",
            message: "not logged in"
        })
    }
    
})

//FUNCTIONAL REQUIREMENT 18: UPDATE OWN PROFILE (ADDON: GET PROFILE)
//[GET] /server-api/get_profile {} [ACCESS_TYPE >= 0]
app.get("/get_profile", async (req, res) => {
console.log("so i got " + req.session.user)

if (req.session.user != null) {
    const pPool = pool.promise();

    //TODO: check which field is null or something
    const [rows, fields] = await pPool.execute("SELECT name,address,payroll_account from accounts WHERE `account_id` = ?", [req.session.user])

    if ((rows as RowDataPacket[]).length > 0) {
        console.log("have data here")
        console.table(rows)
        res.json({
            result: "success",
            message: JSON.stringify(rows)
        })
    }
    else {
        res.json({
            result: "failure",
            message: "no data found"
        })
    }
    
}
else {
    res.json({
        result: "failure",
        message: "not logged in"
    })
}

})

//FUNCTIONAL REQUIREMENT 19: LOGOUT OF PORTAL
/** USER TYPE: Employees, Managers and HR Personnel 
 * INPUT: of the portal will be able to log out of their account,
 * OUTPUT:  terminating the login session.
 */

//[GET] /server-api/logout {} [ACCESS_TYPE >= 0]
app.get("/logout", (req, res) => {
    //clear all the session stuff here
    req.session.user = null
    res.json({
      result: "success",
    })
  })

export default app;