var node = !(typeof exports === 'undefined');
if (node) {

}

(function (exports) {

    var PlanetMapping = function(layer) {

        this.layer = layer;
        this.gameData = layer.gameData;

        this.mapGeneratorParams = layer.mapGeneratorParams();

        this.mappingResolution = 512;
        this.mappingMinVal = 0;
        this.mappingMaxVal = (1 << 31) >>> 0;
        this.mapNames = ["red", "green", "blue", "iron"];

        this.interpMethod = 12;

        // will be internally generated:
        this.vegetationSpecs = [];
        this.mappings = {};

    };

    PlanetMapping.prototype.init = function() {
        this.initVegSpec();
        this.initMapping();
    };

    PlanetMapping.prototype.initVegSpec = function() {


        // define rectangles in which the circular plateaus are randomly generated:
        this.vegetationSpecs = [
            {
                heightName: "debug interpolation",
                maxHeight: 0.001,
                regions: [
                    {
                        name: "white",
                        num_plateaus: 1,
                        temp: 0.2,
                        humidity: 0.2,
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: 255,
                            green: 255,
                            blue: 255,
                            iron: 1
                        }
                    },
                    {
                        name: "red",
                        num_plateaus: 1,
                        temp: 0.8,
                        humidity: 0.2,
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: 255,
                            green: 0,
                            blue: 0,
                            iron: 1
                        }
                    },
                    {
                        name: "green",
                        num_plateaus: 1,
                        temp: 0.2,
                        humidity: 0.8,
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: 1,
                            green: 255,
                            blue: 1,
                            iron: 1
                        }
                    },
                    {
                        name: "blue",
                        num_plateaus: 1,
                        temp: 0.8,//[0.2, 1],
                        humidity: 0.8,//[0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: 1,//[35, 45],
                            green: 1,//[190, 210],
                            blue: 255,//[190, 210],
                            iron: 1
                        }
                    }
                ],
                plateaus: []
            },
            {
                heightName: "water",
                maxHeight: 0.45,
                regions: [
                    {
                        name: "waterice",
                        num_plateaus: 3,
                        temp: [0, 0.2],
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [210, 250],
                            green: [210, 250],
                            blue: [210, 250],
                            iron: 1
                        }
                    },
                    {
                        name: "waterice_boundary",
                        num_plateaus: 20,
                        temp: 0.2,
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [210, 250],
                            green: [210, 250],
                            blue: [210, 250],
                            iron: 1
                        }
                    },
                    {
                        name: "waterice_boundary_blue",
                        num_plateaus: 20,
                        temp: 0.23,
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [35, 45],
                            green: [105, 115],
                            blue: [185, 210],
                            iron: 1
                        }
                    },
                    {
                        name: "water_dark_blue",
                        num_plateaus: 3,
                        temp: [0.2, 1],
                        humidity: [0, 0.4],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [20, 30],
                            green: [15, 25],
                            blue: [110, 130],
                            iron: 1
                        }
                    },
                    {
                        name: "water_blue",
                        num_plateaus: 3,
                        temp: [0.2, 1],
                        humidity: [0.3, 0.7],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [35, 45],
                            green: [105, 115],
                            blue: [185, 210],
                            iron: 1
                        }
                    },
                    {
                        name: "water_turquoise",
                        num_plateaus: 3,
                        temp: 0.8,//[0.2, 1],
                        humidity: 0.8,//[0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: 1,//[35, 45],
                            green: 1,//[190, 210],
                            blue: 255,//[190, 210],
                            iron: 1
                        }
                    }
                ],
                plateaus: []
            },
            {
                heightName: "lowland",
                maxHeight: 0.75,
                regions: [
                    {
                        name: "ice",
                        num_plateaus: 10,
                        temp: [0, 0.2],
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [220, 250],
                            green: [220, 250],
                            blue: [220, 250],
                            iron: [3, 15]
                        }
                    },
                    {
                        name: "tundra",
                        num_plateaus: 10,
                        temp: [0.2, 0.3],
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [85, 95],
                            green: [230, 240],
                            blue: [240, 250],
                            iron: 1
                        }
                    },
                    {
                        name: "taiga",
                        num_plateaus: 10,
                        temp: [0.3, 0.4],
                        humidity: [0.4, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [1, 15],
                            green: [80, 120],
                            blue: [25, 40],
                            iron: 1
                        }
                    },
                    {
                        name: "temperate_grassland_and_desert",
                        num_plateaus: 10,
                        temp: [0.3, 0.7],
                        humidity: [0.2, 0.4],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [190, 210],
                            green: [170, 190],
                            blue: [1, 10],
                            iron: 1
                        }
                    },
                    {
                        name: "subtropical_desert",
                        num_plateaus: 10,
                        temp: [0.3, 1],
                        humidity: [0, 0.2],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [240, 255],
                            green: [140, 160],
                            blue: [15, 35],
                            iron: 1
                        }
                    },
                    {
                        name: "temperate_deciduous_forest",
                        num_plateaus: 10,
                        temp: [0.4, 0.7],
                        humidity: [0.4, 0.7],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [40, 60],
                            green: [170, 190],
                            blue: [70, 90],
                            iron: 1
                        }
                    },
                    {
                        name: "temperate_rain_forest",
                        num_plateaus: 10,
                        temp: [0.4, 0.7],
                        humidity: [0.7, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [1, 10],
                            green: [240, 255],
                            blue: [150, 170],
                            iron: 1
                        }
                    },
                    {
                        name: "savanna",
                        num_plateaus: 10,
                        temp: [0.7, 1],
                        humidity: [0.2, 0.4],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [140, 170],
                            green: [210, 240],
                            blue: [30, 40],
                            iron: 1
                        }
                    },
                    {
                        name: "tropical_seasonal_forest",
                        num_plateaus: 10,
                        temp: [0.7, 1],
                        humidity: [0.4, 0.6],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [140, 170],
                            green: [210, 240],
                            blue: [30, 40],
                            iron: 1
                        }
                    },
                    {
                        name: "tropical_rain_forest",
                        num_plateaus: 10,
                        temp: [0.7, 1],
                        humidity: [0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [1, 15],
                            green: [80, 120],
                            blue: [25, 40],
                            iron: 1
                        }
                    }
                ],
                plateaus: []
            },
            {
                heightName: "mountains",
                maxHeight: Infinity,
                regions: [
                    {
                        name: "mountain_ice",
                        num_plateaus: 7,
                        temp: [0, 0.25],
                        humidity: [0.5, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [220, 250],
                            green: [220, 240],
                            blue: [220, 240],
                            iron: [1, 30]
                        }
                    },
                    {
                        name: "mountain_ice_boundary",
                        num_plateaus: 7,
                        temp: 0.27,
                        humidity: [0.5, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [220, 250],
                            green: [220, 240],
                            blue: [220, 240],
                            iron: [1, 30]
                        }
                    },
                    {
                        name: "mountain_ice_boundary",
                        num_plateaus: 7,
                        temp: [0, 0.25],
                        humidity: 0.47,
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [220, 250],
                            green: [220, 240],
                            blue: [220, 240],
                            iron: [1, 30]
                        }
                    },
                    {
                        name: "mountain_region_gray",
                        num_plateaus: 10,
                        temp: [0, 0.4],
                        humidity: [0.42, 0.45],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [80, 110],
                            green: [80, 110],
                            blue: [80, 110],
                            iron: [30, 60]
                        }
                    },
                    {
                        name: "mountain_region_dark",
                        num_plateaus: 7,
                        temp: [0.25, 0.27],
                        humidity: [0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [60, 60],
                            green: [60, 60],
                            blue: [60, 60],
                            iron: [60, 60]
                        }
                    },
                    {
                        name: "mountain_region_brown",
                        num_plateaus: 20,
                        temp: [0.4, 1],
                        humidity: [0, 0.6],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [80, 100],
                            green: [30, 50],
                            blue: [1, 10],
                            iron: [30, 60]
                        }
                    },
                    {
                        name: "mountain_region_red",
                        num_plateaus: 20,
                        temp: [0.5, 1],
                        humidity: [0.5, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [100, 130],
                            green: [30, 50],
                            blue: [1, 10],
                            iron: [30, 60]
                        }
                    },
                    {
                        name: "mountain_region_green_spots",
                        num_plateaus: 5,
                        temp: [0.6, 0.8],
                        humidity: [0.6, 0.8],
                        radius: [0, 0.001],
                        plateau_specs: {
                            red: [1, 10],
                            green: [120, 150],
                            blue: [60, 100],
                            iron: [30, 60]
                        }
                    }
                ],
                plateaus: []
            }
        ];

    };


    PlanetMapping.prototype.initMapping = function() {
        for  (var v=0; v<this.vegetationSpecs.length; v++) {
            var mapSpec = this.vegetationSpecs[v];
            console.log("start calulating vegetation for height range: "+mapSpec.heightName);
            this.mappings[mapSpec.heightName] = this.genMappingOneHeigth(mapSpec);
        }
    };

    PlanetMapping.prototype.genMappingOneHeigth = function(mapSpec) {

        // create mapping arrays:
        var mappings_cur_height = {};
        for  (var k=0; k<this.mapNames.length; k++) {
            mappings_cur_height[this.mapNames[k]] = new Uint8Array(this.mappingResolution*this.mappingResolution);
        }

        this.fillPlateauSpec(mapSpec);

        var plateaus = mapSpec.plateaus;
        this.genPlateaus(mappings_cur_height, plateaus);
        this.interpPlateaus(mappings_cur_height, plateaus);

        return mappings_cur_height;
    };

    PlanetMapping.prototype.getRandomInRange = function(range_spec, scale_factor) {
        if (range_spec instanceof Array) {
            var min = range_spec[0] * scale_factor;
            var max = range_spec[1] * scale_factor;
            return Math.ceil((max - min) * Math.random() + min);
        }
        else {
            return range_spec * scale_factor;
        }
    };

    PlanetMapping.prototype.fillPlateauSpec = function(mapSpec) {
        for (var r = 0; r < mapSpec.regions.length; r++) {
            var region = mapSpec.regions[r];

            for (var p=0; p<region.num_plateaus; p++) {

                var temp = this.getRandomInRange(region.temp, this.mappingResolution);
                var humidity = this.getRandomInRange(region.humidity, this.mappingResolution);
                var radius = this.getRandomInRange(region.radius, this.mappingResolution);

                var plateau_specs = {};
                for (var m=0; m<this.mapNames.length; m++) {
                    var name = this.mapNames[m];
                    if (region.plateau_specs.hasOwnProperty(name)) {
                        plateau_specs[name] = this.getRandomInRange(region.plateau_specs[name], 1);
                    }
                }

                mapSpec.plateaus.push({
                    temp: temp,
                    humidity: humidity,
                    radius: radius,
                    plateau_specs: plateau_specs
                });
            }
        }
    };

    PlanetMapping.prototype.genPlateaus = function(mappings_cur_height, plateaus) {
        for (var p = 0; p < plateaus.length; p++) {
            var plateau = plateaus[p];
            var temp = plateau.temp;
            var humidity = plateau.humidity;
            var radius = plateau.radius;
            var plateau_specs = plateau.plateau_specs;

            for (var map_name in plateau_specs) {
                var curOutputMap = mappings_cur_height[map_name];

                for (var t_offset = -radius; t_offset < radius; t_offset++) {
                    var t = temp + t_offset;
                    if (t < 0 || t >= this.mappingResolution) {
                        continue;
                    }
                    for (var h_offset = -radius; h_offset < radius; h_offset++) {
                        var h = humidity + h_offset;
                        if (h < 0 || h >= this.mappingResolution) {
                            continue;
                        }
                        if (Math.sqrt(t_offset * t_offset + h_offset * h_offset) < radius) {
                            // we are within the plateau:
                            curOutputMap[t * this.mappingResolution + h] = plateau_specs[map_name];
                        }
                    }
                }
            }
        }
    };


    PlanetMapping.prototype.interpPlateaus = function(mappings_cur_height, plateaus) {
        console.log("interpolate between plateaus");
        for (var k = 0; k < this.mapNames.length; k++) {
            var map_name = this.mapNames[k];
            var curOutputMap = mappings_cur_height[map_name];
            for (var t = 0; t < this.mappingResolution; t++) {
                for (var h = 0; h < this.mappingResolution; h++) {
                    var lin_idx = t * this.mappingResolution + h;
                    if (curOutputMap[lin_idx] == 0) {

                        if (this.interpMethod<10) {
                            // find the three plateaous that are the closest:
                            var closestDist1 = Infinity;
                            var closestDist2 = Infinity;
                            var closestDist3 = Infinity;
                            var closestIdx1 = null;
                            var closestIdx2 = null;
                            var closestIdx3 = null;
                            for (var p = 0; p < plateaus.length; p++) {
                                var plateau = plateaus[p];
                                var temp = plateau.temp;
                                var humidity = plateau.humidity;
                                var radius = plateau.radius;

                                var t_diff = t - temp;
                                var h_diff = h - humidity;
                                var dist = Math.max(Math.sqrt(t_diff * t_diff + h_diff * h_diff) - radius, 0);

                                if (dist < closestDist1) {
                                    closestDist3 = closestDist2;
                                    closestIdx3 = closestIdx2;
                                    closestDist2 = closestDist1;
                                    closestIdx2 = closestIdx1;
                                    closestDist1 = dist;
                                    closestIdx1 = p;
                                }
                                else if (dist < closestDist2) {
                                    closestDist3 = closestDist2;
                                    closestIdx3 = closestIdx2;
                                    closestDist2 = dist;
                                    closestIdx2 = p;
                                }
                                else if (dist < closestDist3) {
                                    closestDist3 = dist;
                                    closestIdx3 = p;
                                }
                            }

                            var plateau1 = plateaus[closestIdx1];
                            var plateau2 = plateaus[closestIdx2];
                            var plateau3 = plateaus[closestIdx3];

                            var v1 = plateau1.plateau_specs[map_name];
                            var v2 = plateau2.plateau_specs[map_name];
                            var v3 = plateau3.plateau_specs[map_name];

                            if (this.interpMethod == 1) {
                                var interp1 = closestDist1 / (closestDist1 + closestDist2);
                                var interp2 = 1 - interp1;
                                curOutputMap[lin_idx] = interp2 * v1 + interp1 * v2;
                            }
                            else if (this.interpMethod == 2) {
                                // calculate distance to the three interconnecting lines:

                                var t1 = plateau1.temp;
                                var t2 = plateau2.temp;
                                var t3 = plateau3.temp;
                                var h1 = plateau1.humidity;
                                var h2 = plateau2.humidity;
                                var h3 = plateau3.humidity;

                                var weight1 = this.calcDistPointToLine(t, t2, t3, h, h2, h3);
                                var weight2 = this.calcDistPointToLine(t, t1, t3, h, h1, h3);
                                var weight3 = this.calcDistPointToLine(t, t1, t2, h, h1, h2);

                                var total_weight = weight1 + weight2 + weight3;
                                weight1 /= total_weight;
                                weight2 /= total_weight;
                                weight3 /= total_weight;

                                curOutputMap[lin_idx] = weight1 * v1 + weight2 * v2 + weight3 * v3;
                            }
                            else if (this.interpMethod == 3) {
                                // inverse distance weighting:
                                var t1 = t - plateau1.temp;
                                var t2 = t - plateau2.temp;
                                var t3 = t - plateau3.temp;

                                var h1 = h - plateau1.humidity;
                                var h2 = h - plateau2.humidity;
                                var h3 = h - plateau3.humidity;

                                var weight1 = 1 / Math.sqrt(t1 * t1 + h1 * h1);
                                var weight2 = 1 / Math.sqrt(t2 * t2 + h2 * h2);
                                var weight3 = 1 / Math.sqrt(t3 * t3 + h3 * h3);

                                weight1 *= weight1;
                                weight2 *= weight2;
                                weight3 *= weight3;

                                var total_weight = weight1 + weight2 + weight3;

                                weight1 /= total_weight;
                                weight2 /= total_weight;
                                weight3 /= total_weight;

                                curOutputMap[lin_idx] = weight1 * v1 + weight2 * v2 + weight3 * v3;
                            }
                        }
                        else {
                            // calculateWeighting to all plateaous:
                            var weighted_sum = 0;
                            var total_weight = 0;
                            for (var p = 0; p < plateaus.length; p++) {
                                var plateau = plateaus[p];
                                var temp = plateau.temp;
                                var humidity = plateau.humidity;
                                var radius = plateau.radius;

                                var t_diff = t - temp;
                                var h_diff = h - humidity;
                                var dist = Math.max(Math.sqrt(t_diff * t_diff + h_diff * h_diff) - radius, 0);

                                dist += 1;

                                var weight = 1 / dist;
                                weight *= weight;
                                weight *= weight;

                                total_weight += weight;
                                weighted_sum += weight * plateau.plateau_specs[map_name];
                            }
                            curOutputMap[lin_idx] = weighted_sum / total_weight;

                        }
                    }
                }
            }
        }
    };


    PlanetMapping.prototype.calcDistPointToLine = function(x0,x1,x2,y0,y1,y2) {
        // calculate distance between (x0,y0) to the line between P1=(x1,y1) and P2(x2,y2):
        var x_diff = x2-x1;
        var y_diff = y2-y1;
        var numerator = Math.abs(y_diff*x0 - x_diff*y0 + x2*y1 - y2*x1);
        var denominator = Math.sqrt(x_diff*x_diff + y_diff*y_diff);
        return numerator/denominator;
    };

    PlanetMapping.prototype.getBitmap = function(heightName, mapName) {

        if (mapName==="rgb") {
            var r = this.mappings[heightName].red;
            var g = this.mappings[heightName].green;
            var b = this.mappings[heightName].blue;
        }
        else {
            var r = this.mappings[heightName][mapName];
            var g = this.mappings[heightName][mapName];
            var b = this.mappings[heightName][mapName];
        }

        var mycanvas = document.createElement("canvas");
        mycanvas.width = this.mappingResolution;
        mycanvas.height =this.mappingResolution;
        var ctx = mycanvas.getContext("2d");
        var imgData = ctx.createImageData(this.mappingResolution, this.mappingResolution);
        var data = imgData.data;

        for (var yDest = 0; yDest < this.mappingResolution; yDest++) {
            var startOfRow = this.mappingResolution * yDest;
            for (var xDest = 0; xDest < this.mappingResolution; xDest++) {
                var startOfPixelDest = (startOfRow + xDest) * 4;
                var startOfPixelSource = (startOfRow + xDest);
                data[startOfPixelDest] = r[startOfPixelSource];
                data[startOfPixelDest + 1] = g[startOfPixelSource];
                data[startOfPixelDest + 2] = b[startOfPixelSource];
                data[startOfPixelDest + 3] = 255; //alpha
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return mycanvas;
    };

    PlanetMapping.prototype.convertToRgb = function(heightScaled, tempScaled, humidityScaled) {

        if (heightScaled < 0.01) {
            heightScaled = 0.01;
        }
        if (heightScaled > 0.99) {
            heightScaled = 0.99;
        }
        if (tempScaled < 0.01) {
            tempScaled = 0.01;
        }
        if (tempScaled > 0.99) {
            tempScaled = 0.99;
        }
        if (humidityScaled < 0.01) {
            humidityScaled = 0.01;
        }
        if (humidityScaled > 0.99) {
            humidityScaled = 0.99;
        }

        var i = 0;
        while (i < this.vegetationSpecs.length - 1 && this.vegetationSpecs[i].maxHeight < heightScaled) {
            i++;
        }

        var heightName = this.vegetationSpecs[i].heightName;

        var colIdx = Math.round(tempScaled * this.mappingResolution);
        var rowIdx = Math.round(humidityScaled * this.mappingResolution);

        var linIdx = colIdx*this.mappingResolution + rowIdx;

        var r = this.mappings[heightName].red[linIdx];
        var g = this.mappings[heightName].green[linIdx];
        var b = this.mappings[heightName].blue[linIdx];

        return {
            r: r,
            g: g,
            b: b
        }

    };

    exports.PlanetMapping = PlanetMapping;

})(node ? exports : window);