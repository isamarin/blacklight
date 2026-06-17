import { Preload } from '../main/preload'

 
declare global {
    interface Window {
        Blacklight: typeof Preload;
    }
}
 