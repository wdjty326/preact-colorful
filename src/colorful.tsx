import { h, Component, createRef } from "preact";

import style from "./style.css";


interface ColorFulProps {
	color: string;
}

interface ColorFulState {
	fillSaturation: string;
	fillHue: string;

	cursorSaturation: {
		x: number;
		y: number;
	};

	cursorHue: number;
}

export default class ColorFul extends Component<ColorFulProps, ColorFulState> {
	private saturation = createRef<HTMLCanvasElement>();
	private saturationPointer = createRef<HTMLDivElement>();

	private hue = createRef<HTMLCanvasElement>();
	private huePointer = createRef<HTMLDivElement>();

	constructor(props: Readonly<ColorFulProps>) {
		super();

		this.state = {
			fillSaturation: props.color,
			fillHue: "#ff0000",

			cursorSaturation: {
				x: 0,
				y: 0,
			},
			cursorHue: 0,
		};
	}

	private huePointerMousemove = (e: MouseEvent | TouchEvent) => {
		e.preventDefault();

		const huePointer = this.huePointer.current;
		if (huePointer) {
			let offsetX = 0;
			if ("changedTouches" in e) {
				const rect = huePointer.getBoundingClientRect();
				offsetX = e.changedTouches[0].clientX - rect.top;
			} else offsetX = e.offsetX;

			this.setState({
				cursorHue: offsetX,
			}, () => {
				const hue = this.hue.current;
				if (hue) {
					const ctx = hue.getContext("2d") as CanvasRenderingContext2D;
					const color = ctx.getImageData(0, 0, 1, 1).data;

					const r = `00${color[0]}`.slice(-2);
					const b = `00${color[1]}`.slice(-2);
					const g = `00${color[2]}`.slice(-2);

					this.setState({ fillHue: `#${r}${b}${g}` });
				}
			});
		}
	};

	componentDidMount() {
		const saturation = this.saturation.current;
		if (saturation) {
			const ctx = saturation.getContext("2d") as CanvasRenderingContext2D;

			const gradient = ctx.createLinearGradient(0, 0, saturation.width, saturation.height / 2);
			gradient.addColorStop(0, "#ffffff");
			gradient.addColorStop(1, this.state.fillHue);
			// gradient.addColorStop(.5, this.state.fillHue);
			// gradient.addColorStop(1, "#000000");
			
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, saturation.width, saturation.height / 2);

			const gradient2 = ctx.createLinearGradient(0, 0, 0, saturation.height);
			gradient2.addColorStop(0, "#ffffff");
			gradient2.addColorStop(.5, this.state.fillHue);
			// gradient.addColorStop(.5, this.state.fillHue);
			gradient2.addColorStop(1, "#000000");

			ctx.fillStyle = gradient2;
			ctx.fillRect(0, saturation.height / 2, saturation.width, saturation.height);
			
			// const 
		}

		const hue = this.hue.current;
		if (hue) {
			const ctx = hue.getContext("2d") as CanvasRenderingContext2D;

			const gradient = ctx.createLinearGradient(0, 0, hue.width, 0);
			gradient.addColorStop(0, "#ff0000");
			gradient.addColorStop(1/6, "#ffff00");
			gradient.addColorStop(2/6, "#00ff00");
			gradient.addColorStop(3/6, "#00ffff");
			gradient.addColorStop(4/6, "#0000ff");
			gradient.addColorStop(5/6, "#ff00ff");
			gradient.addColorStop(1, "#ff0000");

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, hue.width, hue.height);
		}

		const huePointer = this.huePointer.current;
		if (huePointer) {
			huePointer.addEventListener("mousemove", this.huePointerMousemove, false);
		}
	}

	componentWillUnmount() {

	}

	render(props: Readonly<ColorFulProps>, state: Readonly<ColorFulState>) {
		return <div className="colorful">
			<div className="saturation">
				<canvas
					ref={this.saturation}
				/>
				<div
					className="saturation_pointer"
				>
					<div
						className="saturation_pointer_fill"
						style={{
							background: state.fillSaturation,
						}}
					/>
				</div>
			</div>
			<div className={style.hue}>
				<canvas
					ref={this.hue}
				/>
				<div
					ref={this.huePointer}
					className={style.hue_pointer}
				>
					<div
						className={style.hue_pointer_fill}
						style={{
							left: state.cursorHue,
							background: state.fillHue,
						}}
					/>
				</div>
			</div>
		</div>;
	}
}
