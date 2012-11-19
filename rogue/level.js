//pc.script.create('level', function (context) {
    var UNDEFINED = 1;
    var HOLLOW = 0;
    var BLOCKED = 2;
    
    var NEVER = 0;
    var REMEMBERED = 1;
    var INSIGHT = 2;
     
	var Level = function(nRows, nCols) {
		this.create(nRows, nCols);
	}
	
	var createCells = function(nRows, nCols, defaultValue) {
		var cells = new Array(nRows);
		for (var z=0; z < nRows; z++) {
			cells[z] = new Array(nCols);
			for (var x=0; x < nCols; x++)
				cells[z][x] = defaultValue;
		}
		return cells;
	}
	
	Level.prototype = {
		create: function (nRows, nCols) {
			this.rows = nRows;
			this.cols = nCols;
			this.cells = this.createCellArray(UNDEFINED);
			this.seenCells = this.createCellArray(NEVER);
		},
		
		createCellArray: function(defaultValue) {
			return createCells(this.rows, this.cols, defaultValue);
		},
		     
		isCellEmpty: function(x, z) {
			return this.getCellType(x, z) == HOLLOW;
		},
		        
		isOutOfBounds: function(x, z) {
			return z < 0 || z >= this.rows || x < 0 || x >= this.cols;
		},
		
		getCellType: function(x, z) {
        	if (this.isOutOfBounds(x, z))
        		return BLOCKED;
        	return this.cells[z][x];
        },
        
        setCellType: function(x, z, type) {
        	if (this.isOutOfBounds(x, z))
        		return;
        	else
	        	this.cells[z][x] = type;
        },
        
        hasSeenCell: function(x, z) {
        	if (this.isOutOfBounds(x, z))
        		return false;
        	else
	        	return this.seenCells[z][x] != NEVER;
        },
        
        isCellInSight: function(x, z) {
        	if (this.isOutOfBounds(x, z))
        		return false;
        	else
	        	return this.seenCells[z][x] == INSIGHT;
	    },
	    
        setCellSeen: function(x, z, value) {
        	if (this.isOutOfBounds(x, z))
        		return;
        	else
	        	this.seenCells[z][x] = value ? value : REMEMBERED;
        },
        
        seeCellsFrom: function(x0, z0) {
			for (var z=0; z < this.rows; z++) {
				for (var x=0; x < this.cols; x++) {
					if (this.hasSeenCell(x, z))
						this.setCellSeen(x, z, REMEMBERED);
				}
			}
        	var amp = 8;
        	for (var z = z0-amp; z < z0+amp; z++) {
				for (var x = x0-amp; x < x0+amp; x++) {
					if (this.canSeeFrom(x, z, x0, z0))
						this.setCellSeen(x, z, INSIGHT);
				}
        	}
        },
        
        canSeeFrom: function(x1, z1, x0, z0) {
			// Define differences and error check
			var dx = Math.abs(x1 - x0);
			var dz = Math.abs(z1 - z0);
			var sx = (x0 < x1) ? 1 : -1;
			var sz = (z0 < z1) ? 1 : -1;
			var err = dx - dz;
			
			if (!this.isCellEmpty(x1, z1))
				return false;
			
			// Main loop
			while (!((x0 == x1) && (z0 == z1))) {
			  var e2 = err << 1;
			  if (e2 > -dz) {
				err -= dz;
				x0 += sx;
			  }
			  if (e2 < dx) {
				err += dx;
				z0 += sz;
			  }
			  if (!this.isCellEmpty(x0, z0))
			    return false;
			}
			
			return true;
		},
                                
        getRandomTile: function(pos) {
			pos[0] = Util.randomInt(0, this.cols);
			pos[1] = Util.randomInt(0, this.rows);
        },
        
        getRandomEmptyTile: function(pos) {
            for (var i=0; i < 999999; i++) {
            	this.getRandomTile(pos);
        		if (this.isCellEmpty(pos[0], pos[1]))
        			return true;
        	}
        	return false;
        },     

	};
	
// 	return Level;
//});