import User from "@/models/User";
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectionToDatabase } from "./db";


// credentials{email,password}

export const authOptions:NextAuthOptions={
   providers:[
      CredentialsProvider({
         name:"Credentials",
         credentials:{

           email: {label:"Email" ,type:"text"},
           password:{label:"Password",type:"text"}
         },

         async authorize(credentials){
            if(!credentials?.email||!credentials?.password){
               throw new Error("missing email or password")
            }

            try {
               await connectionToDatabase()
               const user=await User.findOne({email:credentials.email})


               if(!user){
                  throw new Error("user not found")
               }

               const isVlaid=await bcrypt.compare(
                  credentials.password,
                  user.password
               )

                          if(!isVlaid){
                  throw new Error("invalid password")
               }

               // next auth return
               return{
                  id:user._id.toString(),
                  email:user.email
                  
               }

            } catch (error) {
               console.log("auth error",error)
               throw error
            }
         }
      })
   ],

   callbacks:{
      // these are overwrite methods
      async jwt({token,user}) {
         if(user){
            token.id=user.id
         }
         return token
         
      },
      async session({token,user,session}) {
         if(session.user){
           session.user.id= token.id as string
         }
         return session;
         
      },
      pages:{
         signIn:"/login",
         error:"/login"
      },
      session:{strategy:"jwt"},
      maxAge:30*24*60*60
     
   },
   secret:process.env.NEXTAUTH_SECRET,
}














// import GithubProvider from "next-auth/providers/github"

// export const authOptions:NextAuthOptions={

//      providers: [
//          GithubProvider({      
//             clientId: process.env.GITHUB_ID!,      
//             clientSecret: process.env.GITHUB_SECRET!,   
//          }),    
//         ]
     
// }