"use strict"

function pythagoras_tree()
{
	function get_next_squares(square, coefs)
	{
		function coefs_to_triangle_len(coefs, len_c)
		{
			let {coef_a, coef_b} = coefs;
			
			let len = {};
			len.a = len_c * coef_a / Math.sqrt(coef_a * coef_a + coef_b * coef_b);
			len.b = len.a * coef_b / coef_a;
			len.c = len_c;
			return len;
		}
		
		function get_C_point(A, B, G, tr_len)
		{
			function get_opposite_point(A, B, G, C1, C2)
			{
				let coef_a = A.y - B.y;
				let coef_b = B.x - A.x;
				let coef_d = A.x * B.y - B.x * A.y;
			
				let f0 = coef_a * G.x + coef_b * G.y + coef_d;
				let f1 = coef_a * C1.x + coef_b * C1.y + coef_d;
			
				if (f0 * f1 < 0)
					return {x: C1.x, y: C1.y};
				return {x: C2.x, y: C2.y};
			}
			
			let p0 = A.x * A.x + A.y * A.y - tr_len.b * tr_len.b;
			let p1 = p0 + tr_len.a * tr_len.a - (B.x * B.x + B.y * B.y);
			let px = 2 * (A.x - B.x);
			let py = 2 * (A.y - B.y);
			
			let C1 = {}, C2 = {};
			if (Math.abs(px) > Math.abs(py))
			{
				let t1 = p1 / px, t2 = py / px;
				let w1 = 1 + t2 * t2;
				let w2 = 2 * (A.x * t2 - t1 * t2 - A.y);
				let w3 = p0 + t1 * t1 - 2 * A.x * t1;
				let sqrt_d = Math.sqrt(w2 * w2 - 4 * w1 * w3);
				C1.y = (-w2 + sqrt_d) / (2 * w1)
				C1.x = t1 - t2 * C1.y;
				C2.y = (-w2 - sqrt_d) / (2 * w1)
				C2.x = t1 - t2 * C2.y;
			}
			else
			{
				let t1 = p1 / py, t2 = px / py;
				let w1 = 1 + t2 * t2;
				let w2 = 2 * (A.y * t2 - t1 * t2 - A.x);
				let w3 = p0 + t1 * t1 - 2 * A.y * t1;
				let sqrt_d = Math.sqrt(w2 * w2 - 4 * w1 * w3);
				C1.x = (-w2 + sqrt_d) / (2 * w1);
				C1.y = t1 - t2 * C1.x;
				C2.x = (-w2 - sqrt_d) / (2 * w1);
				C2.y = t1 - t2 * C2.x;
			}
			return get_opposite_point(A, B, G, C1, C2);
		}
		
		function rot(begin, end, dir)
		{
			let x = end.x - begin.x;
			let y = end.y - begin.y;
			[x, y] = [dir * y, -1 * dir * x];
			x += begin.x;
			y += begin.y;
			return {x, y};
		}
		
		function clone_point(point)
		{
			return {x: point.x, y: point.y};
		}
		
		let new_rec_depth = square.rec_depth + 1;
		if (new_rec_depth > Number.MAX_SAFE_INTEGER)
			throw new Error("get_next_squares Error! Величина рекурсии слишком велика!");
		
		let tr_len = coefs_to_triangle_len(coefs, square.len);
		let C = get_C_point(square.A, square.B, square.G1, tr_len);
		
		const clock = 1, aclock = -1;
		let left_square = {
			A: rot(square.A, C, aclock), B: rot(C, square.A, clock),
			G1: clone_point(square.A), G2: clone_point(C),
			len: tr_len.b,
			rec_depth: new_rec_depth,
		};
		let right_square = {
			A: rot(C, square.B, aclock), B: rot(square.B, C, clock),
			G1: clone_point(C), G2: clone_point(square.B),
			len: tr_len.a,
			rec_depth: new_rec_depth,
		};
		return [left_square, right_square];
	}
	
	function draw_square(square, param)
	{
		let context = param.context;
		const canvas_width  = context.canvas.width;
		const canvas_height = context.canvas.height;
		
		function is_valid_point(point)
		{
			return ( Number.isFinite(point.x) && Number.isFinite(point.y) &&
					 0 <= point.x && point.x <= canvas_width &&
					 0 <= point.y && point.y <= canvas_height );
		}
		
		let {A, B, G1, G2} = square;
		if (is_valid_point(A) && is_valid_point(B) &&
			is_valid_point(G1) && is_valid_point(G2))
		{
			param.draw_begin(context, square.rec_depth, square.len);
			
			context.moveTo(A.x,  canvas_height - A.y);
			context.lineTo(G1.x, canvas_height - G1.y);
			context.moveTo(B.x,  canvas_height - B.y);
			context.lineTo(G2.x, canvas_height - G2.y);
			
			param.draw_end(context, square.rec_depth, square.len);
		}
	}
	
	function create_first_square(square_param)
	{
		function rot(point, angle)
		{
			const cos_theta = Math.cos(angle);
			const sin_theta = Math.sin(angle);
			
			const x = cos_theta * point.x - sin_theta * point.y;
			const y = sin_theta * point.x + cos_theta * point.y;
			return {x, y};
		}
		
		function sum_point(p1, p2)
		{
			return {x: p1.x + p2.x, y: p1.y + p2.y};
		}
		
		let {len, angle} = square_param;
		let G1 = {x: 0,   y: 0};
		let G2 = {x: len, y: 0};
		let A  = {x: 0,   y: len};
		let B  = {x: len, y: len};
		
		G1 = rot(G1, angle);
		G2 = rot(G2, angle);
		A  = rot(A,  angle);
		B  = rot(B,  angle);
		
		let shift = {x: square_param.G1.x, y: square_param.G1.y};
		
		G1 = sum_point(G1, shift);
		G2 = sum_point(G2, shift);
		A  = sum_point(A,  shift);
		B  = sum_point(B,  shift);
		
		let first_square = {G1, G2, A, B, len, rec_depth: 0};
		return first_square;
	}
	
	function draw_tree(param)
	{
		let param_id = param.param_id;
		
		function shedule_tick()
		{
			if (param_id !== param.param_id)
				return;
			
			const iteration_mod = 512;
			let iteration_counter = 0;
			
			let first_square = create_first_square(param.square_param);
			let squares_stack = [first_square];
		
			param.clear_canvas(param.context);
			
			function tick()
			{
				if (param_id !== param.param_id)
					return;
				
				while (squares_stack.length > 0)
				{
					++iteration_counter;
					if (iteration_counter > param.max_iteration_counter)
					{
						param.drawing_finished_error();
						return;
					}
					if (iteration_counter > Number.MAX_SAFE_INTEGER)
						iteration_counter = 0;
					if (iteration_counter % iteration_mod === 0)
						break;
					
					let square = squares_stack.pop();
					let len = square.len;
					let rec_depth = square.rec_depth;
					if (rec_depth > param.max_rec_depth || !Number.isFinite(len) || len < param.min_square_len)
						continue;
					
					draw_square(square, param);
					if (rec_depth !== param.max_rec_depth)
					{
						let [left, right] = get_next_squares(square, param.get_coefs(rec_depth, len));
						squares_stack.push(right);
						squares_stack.push(left);
					}
				}
				
				if (squares_stack.length > 0)
					setTimeout(tick, 4);
				else
					param.drawing_finished_good();
			}
			tick();
		}
		
		setTimeout(shedule_tick, 4);
	}
	
	//==============================================================================
	
	class Range_unit
	{
		constructor(unit)
		{
			this.type   = unit.dataset.controlType;
			this.unit   = unit;
			this.range  = unit.querySelector(".control_elem");
			this.left   = unit.querySelector(".cell_11");
			this.center = unit.querySelector(".cell_12");
			this.right  = unit.querySelector(".cell_13");
		}
		set_state(state = {})
		{
			let {min, max, step, value} = state;
		
			if (min !== undefined)
			{
				this.range.min = min;
				this.left.textContent   = this.range.min;
			}
			if (max !== undefined)
			{
				this.range.max = max;
				this.right.textContent  = this.range.max;
			}
			if (step !== undefined)
				this.range.step = step;
			if (value !== undefined)
			{
				this.range.value = value;
				this.center.textContent = this.range.value;
			}
		}
		get_state()
		{
			return {
				min:   Number(this.range.min),
				max:   Number(this.range.max),
				step:  Number(this.range.step),
				value: Number(this.range.value),
			};
		}
		get_html_state()
		{
			return {
				min:   this.range.getAttribute("min"),
				max:   this.range.getAttribute("max"),
				step:  this.range.getAttribute("step"),
				value: this.range.getAttribute("value"),
			};
		}
		get_id()
		{
			return this.unit.id;
		}
		get_type()
		{
			return this.type;
		}
	}
	
	class Text_unit
	{
		constructor(unit)
		{
			this.type = unit.dataset.controlType;
			this.unit = unit;
			this.text = unit;
		}
		set_state(state = {})
		{
			if (state.value !== undefined)
				this.text.value = state.value;
		}
		get_state()
		{
			return {
				value: this.text.value,
			};
		}
		get_html_state()
		{
			return {
				value: this.text.getAttribute("value"),
			};
		}
		get_id()
		{
			return this.unit.id;
		}
		get_type()
		{
			return this.type;
		}
	}
	
	class Select_unit
	{
		constructor(unit)
		{
			this.type    = unit.dataset.controlType;
			this.unit    = unit;
			this.options = Array.from( unit.querySelectorAll(".control_elem") );
		}
		set_state(state = {})
		{
			if (state.value !== undefined)
			{
				let selected_option = this.options.find(option => option.value === state.value);
				if (selected_option)
					selected_option.selected = true;
			}
		}
		get_state()
		{
			let res = {value: null};
			let selected_option = this.options.find(option => option.selected === true);
			if (selected_option)
				res.value = selected_option.value;
			return res;
		}
		get_html_state()
		{
			let res = {value: null};
			let selected_option = this.options.find(option => option.hasAttribute("selected"));
			if (selected_option)
				res.value = selected_option.getAttribute("value");
			return res;
		}
		get_id()
		{
			return this.unit.id;
		}
		get_type()
		{
			return this.type;
		}
	}
	
	class Color_unit
	{
		constructor(unit)
		{
			this.type  = unit.dataset.controlType;
			this.unit  = unit;
			this.color = unit;
		}
		set_state(state = {})
		{
			if (state.value !== undefined)
				this.color.value = state.value;
		}
		get_state()
		{
			return {
				value: this.color.value,
			};
		}
		get_html_state()
		{
			return {
				value: this.color.getAttribute("value"),
			}
		}
		get_id()
		{
			return this.unit.id;
		}
		get_type()
		{
			return this.type;
		}
	}
	
	function get_unit(elem)
	{
		elem = elem.closest(".control_unit");
		let unit = null;
		if (elem !== null)
			switch (elem.dataset.controlType)
			{
				case "range":
					unit = new Range_unit(elem);
					break;
				case "text":
					unit = new Text_unit(elem);
					break;
				case "select":
					unit = new Select_unit(elem);
					break;
				case "color":
					unit = new Color_unit(elem);
					break;
			}
		return unit;
	}
	
	function get_unit_cache()
	{
		let unit_cache = new Map();
		
		let canvas_control = document.querySelectorAll(".canvas_control");
		for (let i = 0; i < canvas_control.length; ++i)
		{
			let control_units = canvas_control[i].querySelectorAll(".control_unit");
			for (let j = 0; j < control_units.length; ++j)
			{
				let unit = get_unit(control_units[j]);
				unit_cache.set(unit.get_id(), unit);
			}
		}
		return unit_cache;
	}
	
	function prepare_canvas_control(unit_cache)
	{
		for (let unit of unit_cache.values())
			if (unit.get_type() === "range")
			{
				let {min, max, value} = unit.get_state();
				unit.set_state( {min, max, value} );
			}
	}
	
	function restore_default_canvas_control(unit_cache)
	{
		for (let unit of unit_cache.values())
			unit.set_state(unit.get_html_state());
	}
	
	// points_arr - отсортированный по возрастанию x-компоненты массив
	function get_approx_value(points_arr, x)
	{
		function eps_equal(x, y)
		{
			const eps = 1e-10;
			return Math.abs(x - y) < eps;
		}
		function linear_approx(p1, p2, x)
		{
			return (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x) + p1.y;
		}
		
		let [min, mid, max] = points_arr;
		
		if (x <= min.x)
			return min.y;
		if (x <= mid.x)
			if (eps_equal(min.x, mid.x))
				return mid.y;
			else
				return linear_approx(min, mid, x);
		if (x <= max.x)
			if (eps_equal(mid.x, max.x))
				return max.y;
			else
				return linear_approx(mid, max, x);
		return max.y;
	}
	
	function colors_arr_to_color(arr)
	{
		let color = "#";
		for (let el of arr)
		{
			el = Math.round(el);
			if (el < 0)
				el = 0;
			else if (el > 255)
				el = 255;
			color += el.toString(16).padStart(2, "0");
		}
		return color;
	}
	
	function color_to_colors_arr(color)
	{
		let red   = parseInt(color.slice(1, 3), 16);
		let green = parseInt(color.slice(3, 5), 16);
		let blue  = parseInt(color.slice(5, 7), 16);
		return [red, green, blue];
	}
	
	function create_func_draw_begin(unit_cache)
	{
		let lineCap     = unit_cache.get("line_cap").get_state().value;
		let shadowBlur  = unit_cache.get("shadow_blur").get_state().value;
		let shadowColor = unit_cache.get("shadow_color").get_state().value;
		
		let max_rec_depth = unit_cache.get("max_rec_depth").get_state().value;
		
		let line_width = [];
		{
			let p1 = {}, p2 = {}, p3 = {};
			p1.x = unit_cache.get("line_width_1_pos").get_state().value;
			p2.x = unit_cache.get("line_width_2_pos").get_state().value;
			p3.x = unit_cache.get("line_width_3_pos").get_state().value;
			p1.y = unit_cache.get("line_width_1_width").get_state().value;
			p2.y = unit_cache.get("line_width_2_width").get_state().value;
			p3.y = unit_cache.get("line_width_3_width").get_state().value;
			
			let points_arr = [p1, p2, p3].sort((a, b) => a.x - b.x);
			
			for (let i = 0; i <= max_rec_depth; ++i)
				line_width.push( get_approx_value(points_arr, i) );
		}
		
		let stroke_style = [];
		{
			let p1 = {}, p2 = {}, p3 = {};
			p1.x = unit_cache.get("stroke_style_1_pos").get_state().value;
			p2.x = unit_cache.get("stroke_style_2_pos").get_state().value;
			p3.x = unit_cache.get("stroke_style_3_pos").get_state().value;
			
			p1.y = unit_cache.get("stroke_style_1_color").get_state().value;
			p2.y = unit_cache.get("stroke_style_2_color").get_state().value;
			p3.y = unit_cache.get("stroke_style_3_color").get_state().value;
			
			[p1, p2, p3] = [p1, p2, p3].sort((a, b) => a.x - b.x);
			
			let p1_y = color_to_colors_arr(p1.y);
			let p2_y = color_to_colors_arr(p2.y);
			let p3_y = color_to_colors_arr(p3.y);
			
			for (let i = 0; i <= max_rec_depth; ++i)
			{
				let colors_arr = [];
				for (let j = 0; j < 3; ++j)
				{
					p1.y = p1_y[j];
					p2.y = p2_y[j];
					p3.y = p3_y[j];
					colors_arr.push( get_approx_value([p1, p2, p3], i) );
				}
				stroke_style.push( colors_arr_to_color(colors_arr) );
			}
		}
		
		function draw_begin(context, rec_depth, len)
		{
			context.save();
			context.beginPath();
			
			context.lineCap     = lineCap;
			context.shadowBlur  = shadowBlur;
			context.shadowColor = shadowColor;
			
			context.lineWidth   = line_width[rec_depth];
			context.strokeStyle = stroke_style[rec_depth];
		}
		return draw_begin;
	}
	
	function create_func_draw_end(unit_cache)
	{
		return function(context, rec_depth, len)
		{
			context.stroke();
			context.restore();
		}
	}
	
	function create_func_clear_canvas(unit_cache)
	{
		let background_color = unit_cache.get("background_color").get_state().value;
		function clear_canvas(context)
		{
			context.save();
			context.fillStyle = background_color;
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
			context.restore();
		}
		return clear_canvas;
	}
	
	function create_func_get_coefs(unit_cache)
	{
		let coef_a = unit_cache.get("coef_a").get_state().value;
		let coef_b = unit_cache.get("coef_b").get_state().value;
		let coefs_pattern = unit_cache.get("coefs_pattern").get_state().value;
		let max_rec_depth = unit_cache.get("max_rec_depth").get_state().value;
		
		coefs_pattern = coefs_pattern.split("").filter(s => s === "0" || s === "1").join("");
		coefs_pattern += coefs_pattern.length === 0 ? "0" : "";
		coefs_pattern = coefs_pattern.padStart(max_rec_depth + 1, coefs_pattern);
		
		function get_coefs(rec_depth, len)
		{
			if (coefs_pattern[rec_depth] === "0")
				return {coef_a: coef_a, coef_b: coef_b};
			return {coef_a: coef_b, coef_b: coef_a};
		}
		return get_coefs;
	}
	
	function create_square_param(unit_cache)
	{
		let len            = unit_cache.get("first_square_len").get_state().value;
		let first_square_x = unit_cache.get("first_square_x").get_state().value;
		let first_square_y = unit_cache.get("first_square_y").get_state().value;
		let angle          = unit_cache.get("first_square_angle").get_state().value;
		
		angle = angle * Math.PI / 180.0;
		
		return {
			len: len,
			G1:  {x: first_square_x, y: first_square_y},
			angle: angle,
		};
	}
	
	function update_canvas_size(param, unit_id)
	{
		let unit_cache = param.control.unit_cache;
		
		if (unit_id === "canvas_width" || unit_id === "all")
		{
			let canvas_width = unit_cache.get("canvas_width").get_state().value;
			param.context.canvas.width = canvas_width;
			param.control.canvas_control.forEach(elem =>  {
				elem.style.marginLeft = param.context.canvas.width + 15 + "px";
			});
		}
		if (unit_id === "canvas_height" || unit_id === "all")
		{
			let canvas_height = unit_cache.get("canvas_height").get_state().value;
			param.context.canvas.height = canvas_height;
		}
	}
	
	function create_param(unit_cache)
	{
		let param = {};
		
		param.context = document.getElementById("canvas_id").getContext("2d");
		
		param.min_square_len = unit_cache.get("min_square_len").get_state().value;
		param.max_rec_depth  = unit_cache.get("max_rec_depth").get_state().value;
		
		param.max_iteration_counter = Number.MAX_SAFE_INTEGER;
		
		param.draw_begin   = create_func_draw_begin(unit_cache);
		param.draw_end     = create_func_draw_end(unit_cache);
		param.clear_canvas = create_func_clear_canvas(unit_cache);
		
		param.get_coefs = create_func_get_coefs(unit_cache);
		
		param.square_param = create_square_param(unit_cache);
		
		param.drawing_finished_good = function () {
			this.control.state_info.textContent = "Готово.";
		};
		param.drawing_finished_error = function () {
			this.control.state_info.textContent = "Ошибка построения!";
		};
		param.drawing_start = function () {
			this.control.state_info.textContent = "Построение...";
		};
		
		param.control = {};
		param.control.canvas_control         = Array.from( document.querySelectorAll(".canvas_control") );
		param.control.state_info             = document.getElementById("state_info");
		param.control.button_redraw          = document.getElementById("button_redraw");
		param.control.button_stop            = document.getElementById("button_stop");
		param.control.button_restore_default = document.getElementById("button_restore_default");
		param.control.unit_cache             = unit_cache;
		
		param.param_id = Number.MAX_SAFE_INTEGER;
		
		return param;
	}
	
	function main_handler(param, unit_id, event_type)
	{
		let unit_cache = param.control.unit_cache;
		let unit = unit_cache.get(unit_id);
		if (unit !== undefined && unit.get_type() === "range")
			unit.set_state( {value: unit.get_state().value} );
		
		switch (unit_id)
		{
			case "button_restore_default":
				restore_default_canvas_control(param.control.unit_cache);
				//no break;
			case "button_redraw":
				param.min_square_len = param.control.unit_cache.get("min_square_len").get_state().value;
				param.max_rec_depth  = param.control.unit_cache.get("max_rec_depth").get_state().value;
				param.draw_begin     = create_func_draw_begin(param.control.unit_cache);
				param.draw_end       = create_func_draw_end(param.control.unit_cache);
				param.clear_canvas   = create_func_clear_canvas(param.control.unit_cache);
				param.get_coefs      = create_func_get_coefs(param.control.unit_cache);
				param.square_param   = create_square_param(param.control.unit_cache);
				update_canvas_size(param, "all");
				break;
			case "canvas_width":
			case "canvas_height":
				if (event_type === "input")
					return;
				update_canvas_size(param, unit_id);
				break;
			case "min_square_len":
				param.min_square_len = param.control.unit_cache.get("min_square_len").get_state().value;
				break;
			case "max_rec_depth":
				param.max_rec_depth  = param.control.unit_cache.get("max_rec_depth").get_state().value;
				param.draw_begin = create_func_draw_begin(param.control.unit_cache);
				param.get_coefs = create_func_get_coefs(param.control.unit_cache);
				break;
			case "coefs_pattern":
			case "coef_a":
			case "coef_b":
				param.get_coefs = create_func_get_coefs(param.control.unit_cache);
				break;
			case "first_square_len":
			case "first_square_x":
			case "first_square_y":
			case "first_square_angle":
				param.square_param = create_square_param(param.control.unit_cache);
				break;
			case "line_cap":
			case "shadow_blur":
			case "shadow_color":
			case "line_width_1_pos":
			case "line_width_2_pos":
			case "line_width_3_pos":
			case "line_width_1_width":
			case "line_width_2_width":
			case "line_width_3_width":
			case "stroke_style_1_pos":
			case "stroke_style_2_pos":
			case "stroke_style_3_pos":
			case "stroke_style_1_color":
			case "stroke_style_2_color":
			case "stroke_style_3_color":
				param.draw_begin = create_func_draw_begin(param.control.unit_cache);
				break;
			case "background_color":
				param.clear_canvas = create_func_clear_canvas(param.control.unit_cache);
				break;	
		}
		
		++param.param_id;
		if (param.param_id > Number.MAX_SAFE_INTEGER)
			param.param_id = Number.MIN_SAFE_INTEGER;
		
		if (unit_id === "button_stop")
		{
			param.drawing_finished_good();
		}
		else
		{
			param.drawing_start();
			draw_tree(param);
		}
	}
	
	function set_control_change_handler(param)
	{
		let event_elem_cache = new Map();
		
		function event_handler(event)
		{
			let event_elem = event.target;
			let unit_id = event_elem_cache.get(event_elem);
			if (!unit_id)
			{
				unit_id = get_unit(event_elem).get_id();
				event_elem_cache.set(event_elem, unit_id);
			}
			if (event.type !== "change")
				main_handler(param, unit_id, event.type);
			else if (unit_id === "canvas_width" || unit_id === "canvas_height")
				main_handler(param, unit_id, event.type);
		}
		
		let canvas_control = param.control.canvas_control;
		for (let i = 0; i < canvas_control.length; ++i)
		{
			canvas_control[i].addEventListener("input", event_handler);
			canvas_control[i].addEventListener("change", event_handler);
		}
		param.control.button_redraw.addEventListener("click", () => main_handler(param, "button_redraw", "click"));
		param.control.button_stop.addEventListener("click", () => main_handler(param, "button_stop", "click"));
		param.control.button_restore_default.addEventListener("click", () => main_handler(param, "button_restore_default", "click"));
	}
	
	let param = create_param(get_unit_cache());
	
	prepare_canvas_control(param.control.unit_cache);
	update_canvas_size(param, "all");
	set_control_change_handler(param);
	param.drawing_start();
	draw_tree(param);
}

setTimeout(pythagoras_tree, 128);






























