/* Assume 26-ft Box Truck Size
Cargo Capacity- 1,800 cubic feet
Payload Capabilities- Up to 10,000 pounds ~ 4.5 tons
https://www.internationalusedtrucks.com/box-truck-sizes/
*/
const CARGO_TRUCK_TONNAGE_CAPACITY = 4.5;

/*
 An approximate conversion ratio is 1GT = 1.5DWT.
https://livebunkers.com/Shipping-terms/deadweight-tonnage-dwt#:~:text=It%20is%20the%20difference%20between,GT%20and%201GT%20%3D%201.5DWT.
*/

/*
No.	Name 	            Year built 	    GT 	LOA (m) 	Speed (knot)
1	PSA SUSTAINABILITY	1999	    19,131	177	        19.6
2	PSA CONNECTIVITY	1995	    16,800	172.36	    19.5
3	PSA AGILITY	        1994	    7,869	119	        17.0
https://www.psamarine.com/fleet/fleet-list/
*/
const CARGO_SHIP_GROSS_TONNAGE = 16000;
const GT_TO_DWT_CONVERSION_RATIO = 1.5;
const CARGO_SHIP_DEADWEIGHT_TONNAGE = CARGO_SHIP_GROSS_TONNAGE * GT_TO_DWT_CONVERSION_RATIO;

/*
Assume Boeing 777F used for cargo flights
Boeing 777F
Range: 9,200 km (4,970 nautical miles)
Payload Capacity: Up to 102 metric tons
Cargo Volume: 25,270 cubic feet
Popular Routes: Efficient for both long-haul and regional routes (e.g., JFK to AMS, FRA to PVG).
https://psabdp.com/what-we-do/transportation-services/air-freight
https://chatgpt.com/share/670a7269-abc4-8008-acb6-3a2f6ecb512f
*/

const CARGO_AIRCRAFT_TONNAGE_CAPACITY = 102;
const CARGO_AIRCRAFT_SPEED_KM_PER_H = 905;

/*
calculated using the following website
https://www.carboncare.org/en/co2-emissions-calculator
*/

const CARGO_TRUCK_CO2_EMISSIONS_KG_PER_KM_PER_TON =  0.001
const CARGO_SHIP_CO2_EMISSIONS_KG_PER_KM_PER_TON = 0.0095259
const CARGO_AIRCRAFT_CO2_EMISSIONS_KG_PER_KM_PER_TON = 0.44908

const MS_TO_S = 1/ 1000;
const S_TO_H = 1/3600;
const H_TO_DAY = 1/24;

const M_TO_KM = 1 / 1000;


export {
    CARGO_TRUCK_TONNAGE_CAPACITY,
    CARGO_SHIP_DEADWEIGHT_TONNAGE,
    CARGO_AIRCRAFT_TONNAGE_CAPACITY,
    CARGO_AIRCRAFT_SPEED_KM_PER_H,
    CARGO_TRUCK_CO2_EMISSIONS_KG_PER_KM_PER_TON,
    CARGO_SHIP_CO2_EMISSIONS_KG_PER_KM_PER_TON,
    CARGO_AIRCRAFT_CO2_EMISSIONS_KG_PER_KM_PER_TON,
    MS_TO_S,
    S_TO_H,
    H_TO_DAY,
    M_TO_KM
}