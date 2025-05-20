import { Driver } from './driver.entity';
export declare class Load {
    id: number;
    origin: string;
    destination: string;
    price: number;
    eta: Date;
    source: string;
    external_id: string;
    driver_id: number;
    driver: Driver;
    created_at: Date;
    updated_at: Date;
}
