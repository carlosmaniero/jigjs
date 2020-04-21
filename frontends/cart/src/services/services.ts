import {registerCartService} from "./CartService";
import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";



registerCartService(publishEvent, subscribeToEvent);
