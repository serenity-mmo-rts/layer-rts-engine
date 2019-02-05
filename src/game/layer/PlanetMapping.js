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
                heightName: "water",
                maxHeight: 0.33,
                regions: [
                    {
                        name: "waterice",
                        num_plateaus: 1,
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
                        name: "water_dark_blue",
                        num_plateaus: 1,
                        temp: [0.2, 1],
                        humidity: [0, 0.4],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [44, 52],
                            green: [15, 25],
                            blue: [110, 130],
                            iron: 1
                        }
                    },
                    {
                        name: "water_blue",
                        num_plateaus: 1,
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
                        num_plateaus: 1,
                        temp: [0.2, 1],
                        humidity: [0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [35, 45],
                            green: [190, 210],
                            blue: [190, 210],
                            iron: 1
                        }
                    }
                ],
                plateaus: []
            },
            {
                heightName: "lowland",
                maxHeight: 0.66,
                regions: [
                    {
                        name: "ice",
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
                        temp: [0.3, 0.7],
                        humidity: [0.2, 0.4],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [240, 255],
                            green: [210, 230],
                            blue: [1, 10],
                            iron: 1
                        }
                    },
                    {
                        name: "subtropical_desert",
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
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
                        num_plateaus: 1,
                        temp: [0.7, 1],
                        humidity: [0.6, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [1, 10],
                            green: [230, 255],
                            blue: [40, 60],
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
                        num_plateaus: 10,
                        temp: [0, 0.4],
                        humidity: [0, 1],
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
                        temp: [0.3, 0.7],
                        humidity: [0, 1],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [80, 110],
                            green: [80, 110],
                            blue: [80, 110],
                            iron: [30, 60]
                        }
                    },
                    {
                        name: "mountain_region_black",
                        num_plateaus: 4,
                        temp: [0.25, 0.27],
                        humidity: [0.4, 0.43],
                        radius: [0, 0.01],
                        plateau_specs: {
                            red: [20, 40],
                            green: [20, 40],
                            blue: [20, 40],
                            iron: [30, 60]
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
                            red: [150, 200],
                            green: [30, 50],
                            blue: [1, 10],
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
                for (var name in region.plateau_specs) {
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
                        // find the two plateaous that are the closest:
                        var closestDist1 = Infinity;
                        var closestDist2 = Infinity;
                        var closestIdx1 = null;
                        var closestIdx2 = null;
                        for (var p = 0; p < plateaus.length; p++) {
                            var plateau = plateaus[p];
                            var temp = plateau.temp;
                            var humidity = plateau.humidity;
                            var radius = plateau.radius;

                            var t_diff = t - temp;
                            var h_diff = h - humidity;
                            var dist = Math.max(Math.sqrt(t_diff * t_diff + h_diff * h_diff) - radius, 0);

                            if (dist < closestDist1) {
                                closestDist2 = closestDist1;
                                closestIdx2 = closestIdx1;
                                closestDist1 = dist;
                                closestIdx1 = p;
                            }
                            else if (dist < closestDist2) {
                                closestDist2 = dist;
                                closestIdx2 = p;
                            }
                        }
                        var plateau1 = plateaus[closestIdx1];
                        var plateau2 = plateaus[closestIdx2];
                        var v1 = plateau1.plateau_specs[map_name];
                        var v2 = plateau2.plateau_specs[map_name];
                        var interp1 = closestDist1 / (closestDist1 + closestDist2);
                        var interp2 = 1 - interp1;
                        curOutputMap[lin_idx] = interp2 * v1 + interp1 * v2;
                    }
                }
            }
        }
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