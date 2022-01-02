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

		v = s*Math.min(l, 1-l) + l;
		s = v ? 2-2 * l / v : 0;

		s = Math.round(s * 100);
		v = Math.round(v * 100);

		return [h, s, v];
	};

	private getOffset = (e: PointerEvent): {
		offsetX: number;
		offsetY: number;
	} => {
		let offsetX = 0, offsetY = 0;
		if (e.currentTarget) {
			const element = e.currentTarget as HTMLElement;
			const rect = element.getBoundingClientRect();
			offsetX = Math.min(element.offsetWidth, Math.max(0, e.clientX - rect.left));
			offsetY = Math.min(element.offsetHeight, Math.max(0, e.clientY - rect.top));
		}
		return {
			offsetX, offsetY,
		};
	};

	private hueUpdater = (e: PointerEvent): void => {
		e.preventDefault();

		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const hue = e.currentTarget as HTMLDivElement;
			const offsetX = this.getOffset(e).offsetX;
			this.setState({
				hue: Math.round(360 * (offsetX / hue.offsetWidth)),
				cursorHue: offsetX - 12,
			});
		}
	}

	private saturationUpdater = (e: PointerEvent): void => {
		e.preventDefault();

		if ("buttons" in e && e.buttons !== 1) return;
		if (e.currentTarget) {
			const saturation = e.currentTarget as HTMLElement;
			const { offsetX, offsetY } = this.getOffset(e);
			this.setState({
				cursorSaturation: {
					x: offsetX - 12,
					y: offsetY - 12,
				},
				saturation: Math.round(100 * (offsetX / saturation.offsetWidth)),
				value: 100 - Math.round(100 * (offsetY / saturation.offsetHeight)),
			});
		}
	}

	componentDidMount(): void {
		// const saturation = this.saturation.current;
		// if (saturation) {
		// 	saturation.addEventListener("mousemove", this.saturationUpdater, false);
		// 	this.setState((state) => ({
		// 		cursorSaturation: {
		// 			x: saturation.offsetWidth * (state.saturation * 0.01),
		// 			y: saturation.offsetHeight * (1 - state.value * 0.01),
		// 		},
		// 	}));
		// }
		// const hue = this.hue.current;
		// if (hue) {
		// 	hue.addEventListener("mousemove", this.hueUpdater, false);
		// }
	}

	render(props: Readonly<ColorFulProps>, state: Readonly<ColorFulState>): preact.ComponentChildren {
		const l = (2 - state.saturation / 100) * state.value / 2;
		const s = state.saturation * state.value / (l < 50 ? l * 2 : 200 - l * 2);

		return <>
			<div className="colorful">
				<div
					ref={this.saturation}
					className="saturation"
					style={{
						background: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,0), hsl(${state.hue},100%, 50%))`
					}}
					onPointerEnter={(e): void => {
						(e.currentTarget as HTMLDivElement).onpointermove = this.saturationUpdater.bind(this);
						(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
					}}
					onPointerLeave={(e): void => {
						(e.currentTarget as HTMLDivElement).onpointermove = null;
						(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
					}}
				>
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
				<div
					ref={this.hue}
					className="hue"
					onPointerEnter={(e): void => {
						(e.currentTarget as HTMLDivElement).onpointermove = this.hueUpdater.bind(this);
						(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
					}}
					onPointerLeave={(e): void => {
						(e.currentTarget as HTMLDivElement).onpointermove = null;
						(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
					}}
				>
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
		</>;
	}
}

ColorFul.defaultProps = {
	color: "#ff0000",
};
