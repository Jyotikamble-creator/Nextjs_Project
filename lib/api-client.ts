import {IVideo} from "@/models/Video"

export type VideoFormData=Omit<IVideo,"_id">

type FetchOpions={
    method?:"GET" |"POST"| "PUT" |"DELETE"
    body?:any
    headers?:Record<string,string>
}

class ApiClient{

    private async fetch<T>(
        endponit:string,
        options:FetchOpions={}
    ):Promise<T>
    {
        const {method= "GET" ,body,headers={}}=options

        const defaultHeaders={
            "Content-Type":"application/json",
            ...headers,
        }

      const response=  await this .fetch(`/api${endponit}`,{

            method,
            headers:defaultHeaders,
            body:body? JSON.stringify(body):undefined

        }
            )

            if(!response.ok){
                throw new Error(await response.text())
            }

            return response.json()
        
    }

    async getVideos(){
        return this.fetch("/videos")
    }

    
    async uploadVideo(videoData:VideoFormData){
        return this.fetch("/videos",{
            method:"POST",
            body:videoData
        })
    }
}


export const apiClient =new ApiClient()