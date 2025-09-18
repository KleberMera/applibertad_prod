export interface IApiUserAtenticated {
    //fullname: string;
    // nombres: string;
    // apellidos: string;
    // token?: string;
    // avatar?: string;
    // role?: string;
    id: number;
    username: string;
    roles: string[];
    RESET_PASSWORD: number;
}