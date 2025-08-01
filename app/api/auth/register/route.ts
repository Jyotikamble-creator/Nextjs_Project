// get all the data from frontend
// connecting to the database
import { connectionToDatabase } from "@/lib/db";
import User from "@/models/User";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// const hashedPassword = await bcrypt.hash(password, 10);
// await User.create({ email, password: hashedPassword });

export async function POST(request: NextRequest) {
    // check if the request is a POST request
    // validation
    try {
        const { email, password } = await request.json()
        if (!email || !password) {
            return NextResponse.json(
                { error: "email and password are required" },
                { status: 400 }
            )
        }

        // exsiting user check
        await connectionToDatabase()
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: "User already registered" }, { status: 201 });
        }

        // create user database
        await User.create({
            email, password
        })

        // return succesful registretion
        return NextResponse.json(
            { message: "user successfully registered" },
            { status: 201 }
        )
    } catch (error) {
        console.error("registretion error")
        return NextResponse.json(
            { error: "user already registered" },
            { status: 400 }
        )
    }

}