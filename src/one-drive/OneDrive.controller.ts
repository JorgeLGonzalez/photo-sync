import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { OneDriveApi } from './OneDriveApi';

@Controller('ms')
export class OneDriveController {
  public constructor(private readonly api: OneDriveApi) {}

  /**
   * Microsoft should call back with code and other info in query string.
   * See https://learn.microsoft.com/en-us/graph/auth-v2-user#authorization-response
   *
   */
  @Get('oauth2-callback')
  public async getOauth2Callback(
    @Query('code') code: string,
  ): Promise<unknown> {
    this.api.saveToken(code);

    return { message: 'Ok', code };
  }
}

/*
callback query sample:

{
  code: '0.AX0A6odioluSGUG3HFY4BvcH18vTUeL8VrRFiDEFBB3gwKR9AN8.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wUA9P9zfIDPHhW_m-uFEifdksYHb2bIo7SQ7hxuZYkUUMTe67hLmdFjOKtMKqVVDcZMVshEVzoRV1VzHqGf06Zb5h0MnTcnx8bAHLx06ue9aLCF7qnevHXv5Ofzi0YT284xYfWsXHUgBVaZoLWAOA1ubFuG0jx46XrdF5qLA_6q1R1NWBa3uguBfBwESCikZMdXZdI9SWcNiz8wgvbi7lnetpIYPDWH-zQUr4HcM6CQ7d8aFh-K1VsnSU9jKpIS6yzHfNP7byDN0YURLz5xrjANnXYCCXd85FhvvFf-DmQzhJaqCDUqv-7GLuRg-8yN_lynCiiEAl8hpHWIeTzww-5REAe3b_30uwj41qXNhnk80qsxOgMj70yXWPFJ3hYpMNEw-mdg6VdL_k9kSLn8RZpPOnztpFCknMSwWIbMuILRaebHbNFo_8FsxMhoRUztqqejqmR_WIf4jWL9RVLdvONXaPc66TFkwxS6TJpQ_qTuRUX_JPzPDHsm_bowkEUZyR7ouF6JSUCRHCGsl5FVg5s-05TNPOUqnPB1qfNabOPzzq1ReXW5inIz-ayJzIOIzjcLa0uNf2ay6lBthQWjvR94Z4OFd2uoBMuuzIQQFrvfi8OojuBQJ4EiD1s-R9VzEmIWplS0Sa7UIqLmtLxxk_i4jYsVZHsrcDQ5vAzcAftkfzVQ-PioC1Wc1qpmA6TPeTztfNVNm435b2ppQ0nEfpOILqiuKnKZvEXawZtkLZq-j5zEaZi5pMnERc_WO1gBMYgE8FxHxHLPXl-h4lOKarW9QMvle0L2P6I2LEYG6TzvkQTOSxfHgaRPxuUfF7lW7SnkkWfMMjNUPTpk9Q7Ckp9XWoNyRsChOe3FZeTuJSCpaooj3USI3nSFCqVCTC2oTZERaACB4veLySYUIvGyj8xlEPtmgc9BZSmiGjSsyi7pccTMfZQn4KV1KaxL7Ix_yJiZakQCUy1fvWebNebWNUTXFMvAi_1iHR0yGp8EAsxNFBL_stg6Fn3AkuNu-ta-VNINv7igo1b4QmgkIvtAtv2r3g34IA3VmXFDwm9G_7GrU5ZGJ-3K0vrMGod6aWKH3BN040iXIab4OJIZucwkEfP4F9-XEajdtBMJij8fHESSm3Z783EZ1a7cRZ_FBqsqbpz1Taku5KPLZaK0JlpJG1uy5ZmQULZ0ldYfNaiX0tU1lchn44Bd6UFLp_tVnjntXCp4WfktWtHPyTqLLyp0pmjHzYxR5nsOYaA7x7NwqhdeyQE89_LDR0L2QdKMg7h8C-sDrkm5aJW98eRe0HlH2K8Bqe2gruyQ',
  state: 'fudged',
  session_state: '9029c835-d59e-4571-997b-c31fa160bd6e'
}

token request response
{
    "token_type": "Bearer",
    "scope": "Files.Read.All User.Read profile openid email",
    "expires_in": 5397,
    "ext_expires_in": 5397,
    "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6IjY4dXVqeU9fU052b0hTTWtlYVJkYU9BYzIxNUxlTE4tVUJLUTlGNlFRWWsiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMjYyODdlYS05MjViLTQxMTktYjcxYy01NjM4MDZmNzA3ZDcvIiwiaWF0IjoxNjc4MDUzODM2LCJuYmYiOjE2NzgwNTM4MzYsImV4cCI6MTY3ODA1OTUzNCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFZUUFlLzhUQUFBQWhrT01TTmNJTVhid0Vpa016M3pyRXBCR0ludGcyclpKN1I4clFJTTU5OHZEWFVlbm5xRTBoYUgzcE9NVloydGF0WGt4NDNZTWJ0TEJhU2hoeWxBcnpEcG94OVovREcvUzUvT3JrbDhabXdyRk9iS0Y4bllzOEV1WmI1aDZZWGdoWExhR2s0blRYS0VMc2Z5T3d1MkljSTMwUTFSdWNUTnZFSHpESksvVWNWYz0iLCJhbHRzZWNpZCI6IjE6bGl2ZS5jb206MDAwMzNGRkY4MDIzOTNGRSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiUGhvdG9TeW5jIiwiYXBwaWQiOiJlMjUxZDNjYi01NmZjLTQ1YjQtODgzMS0wNTA0MWRlMGMwYTQiLCJhcHBpZGFjciI6IjEiLCJlbWFpbCI6ImpvcmdlLmwuZ29uemFsZXpAb3V0bG9vay5jb20iLCJmYW1pbHlfbmFtZSI6IkdvbnphbGV6IiwiZ2l2ZW5fbmFtZSI6IkpvcmdlIiwiaWRwIjoibGl2ZS5jb20iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxNzMuNDguMTI4LjM1IiwibmFtZSI6IkpvcmdlIEdvbnphbGV6Iiwib2lkIjoiNWZlMjc4ZDMtZWRiYi00YzFjLThkMjEtODZjYzdlYmE2YzgwIiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMyMDAxMzVBMTQ0NDAiLCJyaCI6IjAuQVgwQTZvZGlvbHVTR1VHM0hGWTRCdmNIMXdNQUFBQUFBQUFBd0FBQUFBQUFBQUI5QU44LiIsInNjcCI6IkZpbGVzLlJlYWQuQWxsIFVzZXIuUmVhZCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjZTcGJIZ2RLRGxhdDc0MUhnTVM5SXVyUXplSnNuODh3OE5XdzJ5UkVqTHciLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJhMjYyODdlYS05MjViLTQxMTktYjcxYy01NjM4MDZmNzA3ZDciLCJ1bmlxdWVfbmFtZSI6ImxpdmUuY29tI2pvcmdlLmwuZ29uemFsZXpAb3V0bG9vay5jb20iLCJ1dGkiOiJqQ1RFeWdCZzcwMkdkRmRDczUwVEFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyI2MmU5MDM5NC02OWY1LTQyMzctOTE5MC0wMTIxNzcxNDVlMTAiLCJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX3N0Ijp7InN1YiI6ImVkakxrN18yaEw0NFU0TFlidGRFajZFUGY5VWJrZk0tZ0k4SS03eWM5RTgifSwieG1zX3RjZHQiOjE2MTkzNTQyMDZ9.N13PesUsDsk0HgFx-5PBei5b6TTQoTBbOjH27xHlxyhOINxrxfhcbQJJbEDxrn3zufJ-a-1XbjWjHbX87S-ec0N_RgekHvRj67cSX984adUWRP1y__MIPtj9CYMJayLmmMzRGATrNfYRc1KodyWCAN-vsnVHXpKt048RQX23DXOkkBgUncmODpUFAfyBZL0fufI96EvvNRguc0CaxxlVvsRC3HIExBDWtGsI4Sami0lGRtkwQdQmQogBLjblVGYiUFxYiRnubyvFCL1LroJalcWZ7rqUVCpcELJez7ERM_7jRd0Di8HuERvOxXQcP7v6uSEbq1yTbOARDFoM9p_gWA"
}


client_id=e251d3cb-56fc-45b4-8831-05041de0c0a4&client_secret=GKB8Q%7ErNjerDHcwkVEE6l8PTU-%7EP5E7xrr.4uc3N&code=0.AX0A6odioluSGUG3HFY4BvcH18vTUeL8VrRFiDEFBB3gwKR9AN8.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wUA9P_PofSSsHEWOyFgrHgiarczuk5NMeDJv24edgwWbu2GbOsApIpRa8QmgmgaZGoCPkCxNZ9U3mMy9jHfHXrgcqyBcym29DYD5TcykScH1ye7HcZlysbRzadb65QQlIqX24mShcsIjjkrOyPb2l6kNGhIZ4qf6gnXStHr1Ng5husEt97f7iZy4uz0JNus63qbPUWa99cL2yR2uYk9nAle61YhH72R-EfSDeIp7Hpxiu0FCxGj_kXOSbBdMgRijgtnE-mYIeOLrR4JxdcAGnnyJGdT5-133Osk-7WlYcx8iXPTtyZNsIRuh9x93cPXONYhglV5DIBm5ol0V6d_RfzvKp7d9GGmbBuPOut_0m0xc6nIbxFZZAWyPnuVVjfDbbluIVeTSCBTviiTm5slL0TF_9pj5Sz3viGcurFNukt29pZHSjDi3QbLKLQZHQs2XJpZ5jjpYU-mmzpB3qF6DKSsj45yXH8B-eI9GDP-yRsaHj9KvZHp5Ld7ZUVgX2i8tmnnqjg7F8tf0XXvcEtgxuP9XjpNaCO8dlw4912C7Gc1Os2DP3jTjPGr9-oczEwUks7rIkn9tzFMhQWNi09oYjcbrDaqJJQyHqW5g_XNMVJglZ7qEjvM-6d4WoPiAhLh8VbTLO7FWjmo9smFeZZgemkCgzGqJSqRafmPskXQjUTV1lNH2nlGlHNmSQ0WoywTC7r_diYukPO2c3aWjEHTrxoRtmZLiLfmWGZVjgMyokKI02Y3OCDQA2yYmqwGtalTE0irLyV4H_yJFVkIEHbBPcBaPwjp37aEIkXxxEePL27Pp2pqPFqbfaF5o4eZksD287OCHEfxNjBGdfB_4lfy_5fxuqjvIfVVVTyCzt0uXa0IwdU3yVJHRwLWg_MrHARIvNcKhtGZr85jmViFPxHKCYLKdLKeR1HEX1KUdusUu_sVaKTW6mtYcMXVUa_K7H0HsweY_UsAmzqNtzOnVO16PaQpM31TsEkt9UqM0sLEORXnsx1YFHRsYi0e-EWNQA6lRGPHjr1CjgWW8hsW5dPj5SQ1E9GggJVCjyEnFqAxp47t7vdKZc3d4-ogWn2evY8OFc9JXPbMdqIhUjtYMxhlqZ_zwLMkAZ5jNhq6LbeDnAMnpZFydIN1Ky1omYJ_3gY7SdSr4FpqR3Dzp9cjAgDfxeCdLFCPol7WOb5f1UReI1_sjIHAELRZ41Et5Ap_ZGIEd5YdxBW8zECl3XyanHqDyvslVW7WTsXgylogy2ftpL3bSU_KXSo_28FGak0zwO7B9YKR878V62w442SwXelCLY_a1wSJS3xRMNGX3b3zDbysr88Hz2hrcvJxyOM&grant_type=authorization_code&redirect_uri=%2Fms%2Foauth2-callback&scope=user.read+files.read.all+offline_access
*/