<script lang="ts">
	import { onMount } from 'svelte';
	import { AnimationController } from '@moonmoonbrothers/moon-animation';
	let x: number;
	let y: number;
	const k = 20;
	const animationController = new AnimationController({
		configs: {
			x: {
				moveInfo: { displacement: 150, velocity: 0 },
				equation: ({ displacement }) => -k * displacement
			},
			y: {
				moveInfo: { displacement: 0, velocity: 30 },
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
	<div class="circle" style="transform: translate({x}px, {y}px)" />
</div>

<style>
	.container {
		height: 500px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.circle {
		width: 50px;
		height: 50px;
		background-color: lightblue;
	}
</style>
