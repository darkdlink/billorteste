import { Load } from './load.entity';
export declare class Summary {
    id: number;
    load_id: number;
    load: Load;
    summary_text: string;
    insights: Record<string, any>;
    created_at: Date;
}
