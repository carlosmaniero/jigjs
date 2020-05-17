import {publishEvent, subscribeToEvent} from "../../../../core/src/event-bus";
import {registerCartService} from "./cart-service";



registerCartService(publishEvent, subscribeToEvent);
