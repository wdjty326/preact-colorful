import { h, Component, createRef, Fragment } from "preact";

import "./style.css";


interface ColorFulProps {
	color: string;
}

interface ColorFulState {
	prevColor: string;

	hue: number;
	saturation: number;
	value: number;

	cursorSaturation: {
		x: number;
		y: number;
	};

	cursorHue: number;
}

export default class ColorFul extends Component<ColorFulProps, ColorFulState> {
	private saturation = createRef<HTMLDivElement>();
	private hue = createRef<HTMLDivElement>();

	constructor(props: Readonly<ColorFulProps>) {
		super();

		const hsv = this.rgbToHsv(props.color);
		this.state = {
			prevColor: props.color,

			hue: hsv[0],
			saturation: hsv[1],
			value: hsv[2],

			cursorSaturation: {
				x: 0,
				y: 0,
			},
			cursorHue: 0,
		};
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	static getDerivedStateFromProps (nextProps: Readonly<ColorFulProps>, prevState: Readonly<ColorFulState>) {
		if (nextProps.color !== prevState.prevColor) {
			return {
				prevColor: nextProps.color,
			};
		}

		return null;
	}

	private rgbToHsv = (rgb: string): number[] => {
		const r = parseInt(rgb.slice(1, 3), 16) / 255;
		const g = parseInt(rgb.slice(3, 5), 16) / 255;
		const b = parseInt(rgb.slice(5, 7), 16) / 255;

		let h = 0, s = 0, v = 0;

		const rgbMin = Math.min(r, g, b); // r < g ? (r < b ? r : b) : (g < b ? g : b);
		const rgbMax = Math.max(r, g, b); // r > g ? (r > b ? r : b) : (g > b ? g : b);
		
		const l = (rgbMax + rgbMin) / 2;
		if (rgbMax !== rgbMin) {
			const c = rgbMax - rgbMin;
			s = c / (1 - Math.abs(2 * l - 1));

			switch (rgbMax) {
				case r:
					break;
				case g:
					h = (b - r) / c + 2;
					break;
				case b:
					h = (r - g) / c + 4;
					break;
			}
		}

		h = Math.round(h * 60);
		// s = Math.round(s * 100);
		// l = Math.round(l * 100);

		v = s*Math.min(l, 1-l) + l;
		s = v ? 2-2 * l / v : 0;

		s = Math.round(s * 100);
		v = Math.round(v * 100);

		console.log(h, s, l, v);
		return [h, s, v];
	};

	private hueUpdater = (e: MouseEvent | TouchEvent): void => {
		e.preventDefault();

		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const hueElement = (e.currentTarget as HTMLElement).parentElement as HTMLDivElement;
			let offsetX = 0;
			const rect = hueElement.getBoundingClientRect();
			if ("changedTouches" in e) offsetX = e.changedTouches[0].clientX - rect.left;
			else offsetX = e.clientX - rect.left;

			offsetX = Math.min(
				hueElement.offsetWidth,
				Math.max(
					0,
					offsetX,
				),
			);

			this.setState({
				hue: Math.round(360 * (offsetX / hueElement.offsetWidth)),
				cursorHue: offsetX - 12,
			}, () => {
				// const hue = this.hue.current;
				// if (hue) {
				// 	const radio = hue.width / hue.offsetWidth;
				// 	const ctx = hue.getContext("2d") as CanvasRenderingContext2D;
				// 	const color = ctx.getImageData(Math.round(offsetX * radio), 0, 1, 1).data;

				// 	const r = `00${color[0].toString(16)}`.slice(-2);
				// 	const b = `00${color[1].toString(16)}`.slice(-2);
				// 	const g = `00${color[2].toString(16)}`.slice(-2);

				// 	this.setState({ fillHue: `#${r}${b}${g}` }, () => this.saturationUpdater());
				// }
			});
		}
	}

	private saturationUpdater = (e: MouseEvent | TouchEvent): void => {
		e.preventDefault();

		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const hueElement = (e.currentTarget as HTMLElement).parentElement as HTMLDivElement;
			let offsetX = 0, offsetY = 0;
			const rect = hueElement.getBoundingClientRect();
			if ("changedTouches" in e) {
				offsetX = e.changedTouches[0].clientX - rect.left;
				offsetY = e.changedTouches[0].clientY - rect.top;
			} else {
				offsetX = e.clientX - rect.left;
				offsetY = e.clientY - rect.top;
			}

			offsetX = Math.min(hueElement.offsetWidth, Math.max(0, offsetX));
			offsetY = Math.min(hueElement.offsetHeight, Math.max(0, offsetY));

			this.setState({
				cursorSaturation: {
					x: offsetX - 12,
					y: offsetY - 12,
				},
				saturation: Math.round(100 * (offsetX / hueElement.offsetWidth)),
				value: 100 - Math.round(100 * (offsetY / hueElement.offsetHeight)),
			}, () => {
				console.log(this.state.saturation, this.state.value);
			});

			// const ctx = saturation.getContext("2d") as CanvasRenderingContext2D;
			// ctx.clearRect(0, 0, saturation.width, saturation.height);

			// const gradient = ctx.createLinearGradient(0, 0, 0, saturation.height);
			// gradient.addColorStop(0, "#ffffff");
			// gradient.addColorStop(1, "#000000");
			// // gradient.addColorStop(.5, this.state.fillHue);
			// // gradient.addColorStop(1, "#000000");
			
			// ctx.fillStyle = gradient;
			// ctx.rect(0, 0, saturation.width, saturation.height);
			// ctx.fill();
			// const gradient2 = ctx.createLinearGradient(0, 0, saturation.width, 0);
			// gradient2.addColorStop(0, "#ffffff");
			// // gradient2.addColorStop(1, this.state.fillHue);
			// // gradient.addColorStop(.5, this.state.fillHue);
			// // gradient.addColorStop(1, "#000000");
			
			// ctx.fillStyle = gradient2;
			
			// ctx.fill();			
		}
	}

	componentDidMount(): void {
		const saturation = this.saturation.current;
		if (saturation) {
			saturation.addEventListener("mousemove", this.saturationUpdater, false);
			this.setState((state) => ({
				cursorSaturation: {
					x: saturation.offsetWidth * (state.saturation * 0.01),
					y: saturation.offsetHeight * (1 - state.value * 0.01),
				},
			}));
		}
		const hue = this.hue.current;
		if (hue) {
			hue.addEventListener("mousemove", this.hueUpdater, false);
			// this.setState((state) => ({
			// 	cursorHue: hue.offsetWidth * (360 - state.hue * 0.01),
			// }));
		}
	}

	componentWillUnmount(): void {
		const saturation = this.saturation.current;
		if (saturation) {
			saturation.removeEventListener("mousemove", this.saturationUpdater);
		}
		const hue = this.hue.current;
		if (hue) {
			hue.removeEventListener("mousemove", this.hueUpdater);
		}
	}

	render(props: Readonly<ColorFulProps>, state: Readonly<ColorFulState>): preact.ComponentChildren {
		const l = (2 - state.saturation / 100) * state.value / 2;
		const s = state.saturation * state.value / (l < 50 ? l * 2 : 200 - l * 2);

		return <>
			<div className="colorful">
				<div ref={this.saturation} className="saturation" style={{
					background: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,0), hsl(${state.hue},100%, 50%))`
				}}>
					<div
						className="saturation_pointer"
						style={{
							top: state.cursorSaturation.y,
							left: state.cursorSaturation.x,
						}}
					>
						<div
							className="saturation_pointer_fill"
							style={{
								background: `hsl(${state.hue},${s}%, ${l}%)`,
							}}
						/>
					</div>
				</div>
				<div ref={this.hue} className="hue" onMouseDown={this.hueUpdater}>
					<div
						className="hue_pointer"
						style={{
							left: state.cursorHue,
						}}
					>
						<div
							className="hue_pointer_fill"
							style={{
								background: `hsl(${state.hue}, 100%, 50%)`,
							}}
						/>
					</div>
				</div>
			</div>
			<div>
				h: {state.hue}
				s: {state.saturation}
				v: {state.value}
			</div>
		</>;
	}
}

ColorFul.defaultProps = {
	color: "#ff0000",
};
