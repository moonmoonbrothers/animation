<script lang="ts">
	import { onMount } from 'svelte';
	import { AnimationController, MoonsController } from '@moonmoonbrothers/moon-animation';
	import Page from '../../routes/+page.svelte';
	const k = 9;

	let items = [
		{
			color: 'red'
		},
		{
			color: 'blue'
		}
	];

	let values: Record<'x', number>[] = [
		{
			x: 200
		},
		{
			x: -200
		}
	];

	const animationController = new MoonsController({
		targetIds: items.map(({ color }) => color),
		configFn: (index: number) => ({
			x: {
				moveInfo: { displacement: index ? 200 : -200, velocity: 0 },
				equation: ({ displacement, velocity }) =>
					-9 * (displacement - (index ? -200 : 200)) - velocity * 1
			}
		}),
		animateFn: (props) => {
			values = props;
		}
	});

	onMount(() => {
		animationController.animate();
		return () => animationController.cancel();
	});

	const reverse = () => {
		items = items.reverse();
		animationController.updateTargetIds(items.map(({ color }) => color));
	};
</script>

<div class="container">
	<button on:click={() => reverse()} class="button">Reverse</button>
	<div class="bound" />
	{#each items as { color }, i}
		{@const y = 0}
		{@const { x } = values[i]}
		<div
			class="circle"
			style="background-color: {color}; transform: translate(calc(-50% + {x}px), calc(-50% + {0}px))"
		/>
	{/each}
</div>

<style>
	.container {
		position: relative;
		height: 500px;
	}

	.bound {
		position: absolute;
		width: 400px;
		height: 400px;
		background-color: gray;
		border-radius: 200px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.circle {
		position: absolute;
		width: 40px;
		height: 40px;
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
