const clientId='def2b4508b5a4dfeb13d0ab1fdc50bf5'
const redirectUrl="http://direful-liquid.surge.sh"



let accessToken; 

const Spotify ={
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }

        //check for acess token match

        const accesTokenMatch=window.location.href.match(/access_token=([^&]*)/);
        const expiresMatch=window.location.href.match(/expires_in=([^&]*)/);

        if(accesTokenMatch&&expiresMatch){
            accessToken=accesTokenMatch[1];
            
            const expiresIn=Number(expiresMatch[1]);
         
            //this clears the parameter allowing us to grab a new access token when it expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/'); 
            return accessToken; 
        }
        else{
            const accesUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
            window.location=accesUrl;

        }
    },

    search(term){
        const accessToken =Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}` ,{
            headers: {
                Authorization :`Bearer ${accessToken}`
            }
        }
        ).then(response => {
            return response.json();
        }).then(jsonResponse =>{
            if(!jsonResponse.tracks){
                return [];
            }
            return jsonResponse.tracks.items.map(
                track => ({
                    id:track.id,
                    name:track.name,
                    artists:track.artists[0].name,
                    album:track.album.name,
                    uri:track.uri
                })
            )
        });
    },

    savePlayList(name, trackUris){
        if (!name || !trackUris.length){
            return Promise.resolve();
        }
        const accessToken =Spotify.getAccessToken();
        const headers = {Authorization : `Bearer ${accessToken}` };
        let userId;

        return fetch('https://api.spotify.com/v1/me' , {headers:headers
    }).then(response =>
        response.json() 
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists` ,
            {
                headers:headers,
                method:`POST`,
                body:JSON.stringify({name:name})

            }
            
            ).then(response => response.json()
                ).then(jsonResponse => {
                    const playListId = jsonResponse.id;
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playListId}/tracks` , 
                    {
                        headers:headers,
                        method:`POST`,
                        body:JSON.stringify({uris:trackUris})
                    }).then
                })
        })

    }


}















export default Spotify;