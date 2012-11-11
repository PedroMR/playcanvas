//pc.script.create('level', function (context) {
    var UNDEFINED = 1;
    var HOLLOW = 0;
    var BLOCKED = 2;
    
	var Level = function(nRows, nCols) {
		this.create(nRows, nCols);
	}
	
	Level.prototype = {
		create: function (nRows, nCols) {
			this.rows = nRows;
			this.cols = nCols;
        	this.cells = new Array(this.rows);
        	for (var z=0; z < this.rows; z++) {
        		this.cells[z] = new Array(this.cols);
        		for (var x=0; x < this.cols; x++)
        			this.cells[z][x] = UNDEFINED;
        	}
		},
		        
        getCellType: function(x, z) {
        	if (z < 0 || z >= this.rows || x < 0 || x >= this.cols)
        		return BLOCKED;
        	return this.cells[z][x];
        },
        
        setCellType: function(x, z, type) {
        	if (z < 0 || z >= this.rows || x < 0 || x >= this.cols)
        		return;
        	else
	        	this.cells[z][x] = type;
        },
        
	};
	
// 	return Level;
//});