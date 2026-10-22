// import { HttpErrorResponse } from "@angular/common/http";
// import { CreateComponent } from "../admin/products/create/create.component";
// import { Injectable } from "@angular/core";
// import { HttpClientService } from "../services/common/http-client.service";
// @Injectable({
//     providedIn:'root'
// })
// export class ProductService {
//     constructor(private httpClientService:HttpClientService) { }

//     create(product: CreateComponent, successCallBack?: any, errorCallBack?: any)
//     {
//         this.httpClientService.post({
//             controller:"products"
//         }, product).subscribe(result => {
// successCallBack();
//         },(errorResponse: HttpErrorResponse) => {
//             const _error:Array<{key: string,value:Array<string> }> = errorResponse.error;
//             let message = "";
//             _error.forEach((x,index)=> {
//                 x.value.forEach((_x, _index) => {
//                     message += `${_x}<br>`;
//                 });

//             });
//             errorCallBack(message);
//         });
//     }
// }