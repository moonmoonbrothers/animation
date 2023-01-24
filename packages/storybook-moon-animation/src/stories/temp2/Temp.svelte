<script lang="ts">
	import { onMount } from 'svelte';
	import {  MoonsController } from '@moonmoonbrothers/moon-animation';

	let items = [
		{
			color: 'red'
		},
		{
			color: 'blue'
		},
		{
			color: 'green'
		},
		{
			color: 'teal'
		},
		{
			color: 'white'
		},
		{
			color: 'yellow'
		},
		{
			color: 'purple',
		},
		{
			color: 'orange',
		},
		{
			color: 'lightgreen',
		}
	];

	let values: Record<'x' | 'y', number>[] = [];

	const K = 9;
	const temp = (index: number) => {
		return {
			k: 4 + index / 2,
			x: 400 - index * 50
		};
	};
	const animationController = new MoonsController({
		targetIds: items.map(({ color }) => color),
		configFn: (index: number) => {
			const { k, x } = temp(index);
			return {
				x: {
					moveInfo: { displacement: x, velocity: 0 },
					equation: ({ displacement }) => -k * displacement
				},
				y: {
					moveInfo: { displacement: 0, velocity: x * Math.sqrt(k) },
					equation: ({ displacement }) => -k * displacement
				}
			};
		},
		animateFn: (props) => {
			values = props;
		}
	});

	onMount(() => {
		animationController.animate();
		return () => animationController.cancel();
	});

	const reverse = () => {
		items = items.sort(() => Math.random() - Math.random())
		animationController.updateTargetIds(items.map(({ color }) => color));
	};
</script>

<div class="container">
	<button on:click={() => reverse()} class="button">Random Mix!</button>
	<div class="bound" />
	{#each items as { color }, i}
		{@const value = values[i]}
		{#if value}
			{@const { x, y } = values[i]}
			<div
				class="circle"
				style="background-color: {color}; transform: translate(calc(-50% + {x}px), calc(-50% + {y}px))"
			/>
		{/if}
	{/each}
</div>

<style>
	.container {
		position: relative;
		height: 1000px;
	}

	.bound {
		--radius: 800px;
		position: absolute;
		width: var(--radius);
		height: var(--radius);
		border-radius: var(--radius);
		background-color: black;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.circle {
		position: absolute;
		width: 30px;
		height: 30px;
		border-radius: 200px;
		top: 50%;
		left: 50%;
	}

	.button {
		background-color: blue;
		padding: 10px 20px;
		font-size: 24px;
		color: white;
	}
</style>
