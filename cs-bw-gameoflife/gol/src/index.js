import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {ButtonToolbar, DropdownButton, Dropdown} from 'react-bootstrap';


class Box extends React.Component {
	// there's no way of passing props inside the render method so we create
	// this local function that calls the funciton in props
	selectBox = () => {
		this.props.selectBox(this.props.row, this.props.col);
	}

	render () {
		return (
			<div 
				className={this.props.boxClass}
				id={this.props.id}
				onClick={this.selectBox}
			/>
				
			
		);
	}
}

class Grid extends React.Component {
	render() {
		const width = (this.props.cols * 14);
		var rowsArr = [];

		var boxClass = "";
		for (var i = 0; i < this.props.rows; i++) {
  			for (var j = 0; j < this.props.cols; j++) {
    			let boxId = i + "_" + j;

    			boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
    			rowsArr.push(
    				<Box 
    					boxClass ={boxClass}
    					key={boxId}
    					boxId={boxId}
    					row={i}
    					col={j}
    					selectBox={this.props.selectBox}
    				/>
    			);
		  	}
		}

		return (
			<div className="grid" style={{width: width}}>
				{rowsArr}
			</div>
		);
	}
}

class Buttons extends React.Component {

	handleSelect = (evt) => {
		this.props.gridSize(evt)
	}

	render() {
		return (
			<div className="center">
				<ButtonToolbar>
					{/* https://www.w3schools.com/bootstrap/bootstrap_buttons.asp */}
					<button className="btn-primary" onClick={this.props.playButton}>
						Play
					</button>
					<button className="btn-primary" onClick={this.props.pauseButton}>
						Pause
					</button>
					<button className="btn-primary" onClick={this.props.clear}>
						Clear
					</button>
					<button className="btn-primary" onClick={this.props.slow}>
						Slow
					</button>
					<button className="btn-primary" onClick={this.props.fast}>
						Fast
					</button>
					<button className="btn-primary" onClick={this.props.seed}>
						Seed
					</button>
					<DropdownButton
						title="Grid Size"
						id="size-menu"
						onSelect={this.handleSelect}
					>
						{/* MenuItem deprecated https://github.com/react-bootstrap/react-bootstrap/issues/3433 */}
						<Dropdown.Item eventKey="1">20x10</Dropdown.Item>
						<Dropdown.Item eventKey="2">50x30</Dropdown.Item>
						<Dropdown.Item eventKey="3">70x50</Dropdown.Item>
					</DropdownButton>
				</ButtonToolbar>
			</div>
		);
	}
}

class Main extends React.Component {
	constructor() {
		super();
		this.speed = 100;
		this.rows = 30;
		this.cols = 50;

		this.state = {
			generation: 0,
			// .fill() changes all elements in array to static value
			// create an array with 'row' no. of elements and for each element
			// fill it with an array with 'col' no. of elements of the value 'false'
			gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
		}
	}

	selectBox = (row, col) => {
		let gridCopy = arrayClone(this.state.gridFull);
		gridCopy[row][col] = !gridCopy[row][col];
		this.setState({
			gridFull: gridCopy
		});
	}

	seed = () => {
		let gridCopy = arrayClone(this.state.gridFull);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (Math.floor(Math.random() * 4) === 1) {
					gridCopy[i][j] = true;
				}
			}
		}
		this.setState({
			gridFull: gridCopy
		});
	}

	playButton = () => {
		// if someone clicks play button we want it to stop the interval
		clearInterval(this.intervalId)
		this.intervalId = setInterval(this.play, this.speed);
	}

	pauseButton = () => {
		clearInterval(this.intervalId)
	}

	slow = () => {
		this.speed = 1000;
		this.playButton();
	}

	fast = () => {
		this.speed = 100;
		this.playButton();
	}

	clear = () => {
		var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
		this.setState({
			gridFull: grid,
			generation: 0
		});
	}

	gridSize = (size) => {
		switch (size) {
			case "1":
				this.cols = 20;
				this.rows = 10;
			break
			case "2":
				this.cols = 50;
				this.rows = 30;
			break
			default:
				this.cols = 70;
				this.rows = 30;
		}
		this.clear();
	}
	
	play = () => {
		let g = this.state.gridFull;
		let g2 = arrayClone(this.state.gridFull);

		// go through each cell and check its neighbours
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let count = 0;
				// if the cell above is true, increment count
				if (i > 0) if (g[i-1][j]) count++;
				// if not first column AND the cell top-left is true, increment count
				if (i > 0 && j > 0) if (g[i-1][j-1]) count++;
				// if not last column AND cell top-right is true, increment count
				if (i > 0 && j < this.cols - 1) if (g[i-1][j+1]) count++;
				// if cell right is true, increment count
				if (j < this.cols -1) if (g[i][j+1]) count++;
				// if cell left is true, incrememnt count
				if (j > 0) if (g[i][j-1]) count++;
				// if not last row AND cell bottom is true, increment count
				if (i < this.rows - 1) if (g[i+1][j]) count++;
				// if not last row AND not first col AND cell bottom left true, increment count
				if (i < this.rows - 1 && j > 0) if (g[i+1][j-1]) count++;
				// if not last row AND not last col AND cell bottom-right is true, increment count
				if (i < this.rows - 1 && j < this.cols - 1) if (g[i+1][j+1]) count++;
				
				// if cell alive AND count < 2 it dies
				if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
				// if cell dead AND count === 3 it comes alive
				if (!g[i][j] && count === 3) g2[i][j] = true;
			}
		}
		this.setState({
			gridFull: g2,
			generation: this.state.generation + 1
		});
	}

	componentDidMount() {
		this.seed();
		this.playButton();
	}

	render() {
		return (
			<div>
				<h1>The Game of Life</h1>
				<Buttons
					playButton={this.playButton}
					pauseButton={this.pauseButton}
					slow={this.slow}
					fast={this.fast}
					clear={this.clear}
					seed={this.seed}
					gridSize={this.gridSize}
				/>
				<Grid 
					gridFull={this.state.gridFull}
					rows={this.rows}
					cols={this.cols}
					selectBox={this.selectBox}

				/>
				<h2>Generations: {this.state.generation}</h2>			
			</div>
		);
	}
}

function arrayClone(arr) {
	return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById('root'));