<script lang="ts">
	import { onMount } from 'svelte';
	import { AnimationController } from '@moonmoonbrothers/moon-animation';
	let x: number;
	let y: number;
	const k = 9;
	const animationController = new AnimationController({
		configs: {
			x: {
				moveInfo: { displacement: 100, velocity: 0 },
				equation: ({ displacement }) => -k * displacement
			},
			y: {
				moveInfo: { displacement: 0, velocity: 300 },
				equation: ({ displacement }) => -k * displacement
			}
		},
		animateFn: (current) => {
			[x, y] = [current.x, current.y];
		}
	});

	onMount(() => {
		animationController.animate();
		return () => animationController.cancel();
	});

</script>

<div class="container">
	<div class="bound"></div>
	<div class="circle" style="transform: translate({x}px, {y}px)" />
</div>

<style>
	.container {
		position: relative;
		height: 500px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.bound {
		position: absolute;
		width: 200px;
		height: 200px;
		background-color: gray;
		border-radius: 200px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

	}

	.circle {
		width: 40px;
		height: 40px;
		border-radius: 200px;
		background-color: lightblue;
	}
</style>
